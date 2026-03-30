"""
Aadesh AI — VPS Deployment Script
Deploys Next.js standalone output to DigitalOcean VPS via Paramiko
Date: 2026-03-28
"""
import sys
import io
# FIX 2026-03-30: Force UTF-8 output on Windows (prevents UnicodeEncodeError for ✓ chars)
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

import paramiko
import os
import time

VPS_HOST = "165.232.176.181"
VPS_USER = os.environ.get("VPS_USER", "root")
VPS_PASS = os.environ.get("VPS_PASS")
if not VPS_PASS:
    # Try reading from .env.vps file
    vps_pass_file = os.path.join(os.path.dirname(__file__), ".env.vps")
    if os.path.exists(vps_pass_file):
        with open(vps_pass_file, "r") as f:
            VPS_PASS = f.read().strip()
if not VPS_PASS:
    VPS_PASS = input("Enter VPS password: ").strip()
    if not VPS_PASS:
        print("ERROR: VPS password required.")
        print("Options: (1) Create .env.vps with your password  (2) Set VPS_PASS env var  (3) Enter when prompted")
        sys.exit(1)

# Read .env content from a local file instead of hardcoding secrets
ENV_FILE_PATH = os.path.join(os.path.dirname(__file__), ".env.deploy")
if os.path.exists(ENV_FILE_PATH):
    with open(ENV_FILE_PATH, "r", encoding="utf-8") as f:
        ENV_CONTENT = f.read()
else:
    print(f"ERROR: {ENV_FILE_PATH} not found.")
    print("Create .env.deploy with your production environment variables.")
    print("Required keys: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,")
    print("  SUPABASE_SERVICE_ROLE_KEY, SARVAM_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET")
    sys.exit(1)

NGINX_CONF_HTTP_ONLY = """server {
    listen 80;
    server_name aadesh-ai.in www.aadesh-ai.in;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
"""

# FIX 2026-03-30: Always write full HTTPS config when SSL certs exist.
# deploy_vps.py was previously overwriting the HTTPS config with HTTP-only on every deploy.
NGINX_CONF_HTTPS = """server {
    listen 80;
    server_name aadesh-ai.in www.aadesh-ai.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name aadesh-ai.in www.aadesh-ai.in;

    ssl_certificate /etc/letsencrypt/live/aadesh-ai.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aadesh-ai.in/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Required for Supabase JWT cookies (prevents 502 on OAuth)
    proxy_buffer_size 16k;
    proxy_buffers 4 16k;
    proxy_busy_buffers_size 16k;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
"""

def ssh_run(client, cmd, description=""):
    """Run a command over SSH and print output."""
    if description:
        print(f"\n>>> {description}")
    print(f"$ {cmd[:80]}{'...' if len(cmd) > 80 else ''}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=300)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    exit_code = stdout.channel.recv_exit_status()
    if out.strip():
        print(out.strip())
    if err.strip() and exit_code != 0:
        print(f"STDERR: {err.strip()}")
    if exit_code != 0:
        print(f"[EXIT CODE: {exit_code}]")
    return exit_code, out, err


def upload_dir(sftp, local_path, remote_path):
    """Recursively upload a directory via SFTP."""
    try:
        entries = os.listdir(local_path)
    except (FileNotFoundError, OSError) as e:
        # Skip directories that can't be read (Windows symlinks, OneDrive issues)
        print(f"  SKIP (unreadable): {local_path} — {e}")
        return

    try:
        sftp.mkdir(remote_path)
    except IOError:
        pass  # Already exists

    for item in entries:
        local_item = os.path.join(local_path, item)
        remote_item = remote_path + "/" + item
        try:
            if os.path.isfile(local_item):
                sftp.put(local_item, remote_item)
            elif os.path.isdir(local_item):
                upload_dir(sftp, local_item, remote_item)
        except (FileNotFoundError, OSError):
            print(f"  SKIP: {local_item}")
            continue


def main():
    print("=" * 60)
    print("AADESH AI — VPS DEPLOYMENT")
    print("=" * 60)

    # ── CONNECT ────────────────────────────────────────────────
    print("\n[1/8] Connecting to VPS...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
    print(f"✓ Connected to {VPS_HOST}")

    # ── SWAP FILE ──────────────────────────────────────────────
    print("\n[2/8] Setting up 2GB swap file (prevents OOM)...")
    code, out, _ = ssh_run(client, "swapon --show", "Check existing swap")
    if "swapfile" in out or "swap" in out.lower():
        print("✓ Swap already configured, skipping")
    else:
        ssh_run(client, "fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile", "Create swap")
        ssh_run(client, "echo '/swapfile none swap sw 0 0' >> /etc/fstab", "Persist swap")
        ssh_run(client, "free -h", "Verify swap")
        print("✓ Swap configured")

    # ── NODE.JS 20 ─────────────────────────────────────────────
    print("\n[3/8] Installing Node.js 20...")
    code, out, _ = ssh_run(client, "node --version 2>/dev/null || echo 'NOT_INSTALLED'")
    if "v20" in out or "v21" in out or "v22" in out:
        print(f"✓ Node.js already installed: {out.strip()}")
    else:
        ssh_run(client, "apt-get update -qq", "Update apt")
        ssh_run(client, "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -", "Add NodeSource repo")
        ssh_run(client, "apt-get install -y nodejs", "Install Node.js 20")
        code, out, _ = ssh_run(client, "node --version", "Verify Node.js")
        print(f"✓ Node.js installed: {out.strip()}")

    # ── PM2 ────────────────────────────────────────────────────
    print("\n[4/8] Installing PM2...")
    code, out, _ = ssh_run(client, "pm2 --version 2>/dev/null || echo 'NOT_INSTALLED'")
    if "NOT_INSTALLED" not in out:
        print(f"✓ PM2 already installed: {out.strip()}")
    else:
        ssh_run(client, "npm install -g pm2", "Install PM2 globally")
        print("✓ PM2 installed")

    # ── TRANSFER STANDALONE BUILD ──────────────────────────────
    print("\n[5/8] Transferring built app to VPS...")
    sftp = client.open_sftp()

    # The standalone output structure from Next.js is:
    # .next/standalone/ → contains server.js + node_modules + .next/server
    # We need to also copy .next/static and public into standalone/

    app_dir = os.path.join(os.path.dirname(__file__), "nextjs")  # FIX 2026-03-30: use relative path
    standalone_src = os.path.join(app_dir, ".next", "standalone")
    static_src = os.path.join(app_dir, ".next", "static")
    public_src = os.path.join(app_dir, "public")

    # Create remote app directory
    ssh_run(client, "rm -rf /root/aadesh-ai && mkdir -p /root/aadesh-ai", "Create remote app dir")

    # Upload standalone output
    print("  Uploading standalone build (this may take 1-2 min)...")
    upload_dir(sftp, standalone_src, "/root/aadesh-ai")

    # Upload static files into /root/aadesh-ai/.next/static/
    print("  Uploading static assets...")
    ssh_run(client, "mkdir -p /root/aadesh-ai/.next/static")
    upload_dir(sftp, static_src, "/root/aadesh-ai/.next/static")

    # Upload public folder
    print("  Uploading public folder...")
    upload_dir(sftp, public_src, "/root/aadesh-ai/public")

    # Write .env.local on VPS
    print("  Writing .env.local on VPS...")
    with sftp.open("/root/aadesh-ai/.env.local", "w") as f:
        f.write(ENV_CONTENT)
    print("✓ Files transferred")

    sftp.close()

    # ── START WITH PM2 ─────────────────────────────────────────
    print("\n[6/8] Starting app with PM2...")
    ssh_run(client, "pm2 delete aadesh-ai 2>/dev/null; true", "Stop old instance if any")
    code, out, err = ssh_run(
        client,
        "cd /root/aadesh-ai && PORT=3000 HOSTNAME=0.0.0.0 pm2 start server.js --name aadesh-ai",
        "Start with PM2"
    )
    if code == 0:
        print("✓ App started with PM2")
    else:
        print(f"⚠ PM2 start may have an issue: {err}")

    ssh_run(client, "pm2 save", "Save PM2 process list")
    ssh_run(client, "pm2 startup 2>&1 | tail -5", "Configure PM2 startup")
    ssh_run(client, "pm2 list", "Show PM2 status")

    # ── NGINX ──────────────────────────────────────────────────
    print("\n[7/8] Setting up Nginx reverse proxy...")
    code, out, _ = ssh_run(client, "which nginx 2>/dev/null || echo 'NOT_INSTALLED'")
    if "NOT_INSTALLED" in out:
        ssh_run(client, "apt-get install -y nginx", "Install Nginx")

    # Auto-detect SSL certs — use HTTPS config if certs exist, HTTP-only otherwise
    code, out, _ = ssh_run(client, "test -f /etc/letsencrypt/live/aadesh-ai.in/fullchain.pem && echo 'CERTS_EXIST' || echo 'NO_CERTS'", "Check SSL certs")
    if "CERTS_EXIST" in out:
        nginx_config = NGINX_CONF_HTTPS
        print("✓ SSL certs found — using HTTPS config")
    else:
        nginx_config = NGINX_CONF_HTTP_ONLY
        print("⚠ No SSL certs found — using HTTP-only config (run certbot after deploy)")

    # Write Nginx config
    sftp2 = client.open_sftp()
    with sftp2.open("/etc/nginx/sites-available/aadesh-ai", "w") as f:
        f.write(nginx_config)
    sftp2.close()

    ssh_run(client, "ln -sf /etc/nginx/sites-available/aadesh-ai /etc/nginx/sites-enabled/aadesh-ai", "Enable site")
    ssh_run(client, "rm -f /etc/nginx/sites-enabled/default", "Disable default site")
    code, out, err = ssh_run(client, "nginx -t", "Test Nginx config")
    if code == 0:
        ssh_run(client, "systemctl restart nginx", "Restart Nginx")
        print("✓ Nginx configured and restarted")
    else:
        print(f"⚠ Nginx config test failed: {err}")

    # ── VERIFY ─────────────────────────────────────────────────
    print("\n[8/8] Verifying deployment...")
    time.sleep(5)  # Wait for app to start
    code, out, err = ssh_run(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/", "Health check :3000")
    if "200" in out or "308" in out or "307" in out or "301" in out or "302" in out:
        print(f"✓ App responding on port 3000 (HTTP {out.strip()})")
    else:
        print(f"⚠ Unexpected response on port 3000: '{out.strip()}'")
        ssh_run(client, "pm2 logs aadesh-ai --lines 20 --nostream", "Check PM2 logs")

    code, out, err = ssh_run(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:80/ 2>/dev/null || echo 'port 80 error'", "Health check :80 via Nginx")
    print(f"  Nginx port 80 response: HTTP {out.strip()}")

    client.close()

    print("\n" + "=" * 60)
    print("DEPLOYMENT COMPLETE")
    print(f"Live URL: https://aadesh-ai.in")
    print(f"Direct:   http://{VPS_HOST}:3000")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Open https://aadesh-ai.in in your browser")
    print("2. Test login with banu.test@aadesh-ai.in")
    print("3. Check /app route loads dashboard after login")
    print("4. Tell Banu the URL is live!")


if __name__ == "__main__":
    main()
