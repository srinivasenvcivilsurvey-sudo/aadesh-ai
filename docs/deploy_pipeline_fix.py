"""
Deploy pipeline upload fix to VPS.
Copies the updated FileUploadStep component and rebuilt .next chunks, then restarts PM2.
"""
import os
import time
import paramiko
from pathlib import Path

VPS_HOST = "165.232.176.181"
VPS_USER = "root"
SCRIPT_DIR = Path(__file__).parent

with open(SCRIPT_DIR / ".env.vps") as f:
    VPS_PASS = f.read().strip()

LOCAL_NEXT = SCRIPT_DIR / "nextjs" / ".next" / "standalone"
LOCAL_STATIC = SCRIPT_DIR / "nextjs" / ".next" / "static"
LOCAL_PUBLIC = SCRIPT_DIR / "nextjs" / "public"

VPS_APP = "/root/aadesh-ai"
VPS_SRC = "/root/aadesh-ai-src/nextjs"


def run(client, cmd, label, timeout=60):
    print(f"\n=== {label} ===")
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    combined = out + ("\nSTDERR: " + err if err.strip() else "")
    print(combined.strip()[:2000])
    return out


def upload_dir(sftp, local_dir: Path, remote_dir: str):
    """Recursively upload a directory via SFTP."""
    try:
        sftp.stat(remote_dir)
    except FileNotFoundError:
        sftp.mkdir(remote_dir)

    for item in local_dir.iterdir():
        remote_path = f"{remote_dir}/{item.name}"
        if item.is_dir():
            upload_dir(sftp, item, remote_path)
        else:
            sftp.put(str(item), remote_path)


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
print("✅ Connected to VPS")

# 1. Check PM2 status
run(client, "pm2 list --no-color 2>&1 | head -20", "PM2 current state")

# 2. Upload the rebuilt standalone app
print("\n=== Uploading rebuilt standalone app (this may take 30-60s) ===")
sftp = client.open_sftp()

# Upload standalone server files
print("  Uploading .next/standalone → /root/aadesh-ai ...")
upload_dir(sftp, LOCAL_NEXT, VPS_APP)

# Upload static assets
print("  Uploading .next/static → /root/aadesh-ai/.next/static ...")
run(client, f"mkdir -p {VPS_APP}/.next/static", "mkdir static")
upload_dir(sftp, LOCAL_STATIC, f"{VPS_APP}/.next/static")

# Upload public folder
print("  Uploading public → /root/aadesh-ai/public ...")
run(client, f"mkdir -p {VPS_APP}/public", "mkdir public")
upload_dir(sftp, LOCAL_PUBLIC, f"{VPS_APP}/public")

sftp.close()
print("✅ Upload complete")

# 3. Restart PM2 with env vars
run(client,
    f"cd {VPS_APP} && set -a && . ./.env.local && set +a && pm2 restart aadesh-ai --update-env 2>&1",
    "PM2 restart with env",
    timeout=60)

# 4. Wait for cold start
print("\n=== waiting 8s for cold start ===")
time.sleep(8)

# 5. Verify
run(client, "pm2 list --no-color 2>&1 | head -20", "PM2 state after restart")
run(client, 'curl -s -o /dev/null -w "HTTP %{http_code} | %{time_total}s\\n" --max-time 15 https://aadesh-ai.in/', "Health check")
run(client, "pm2 logs aadesh-ai --lines 20 --nostream --no-color 2>&1 | tail -25", "PM2 logs (last 20)")

client.close()
print("\n✅ Deploy complete. Test at https://aadesh-ai.in/app/pipeline")
