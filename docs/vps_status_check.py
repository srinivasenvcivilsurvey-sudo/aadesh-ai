"""
VPS Status Check + PM2 Fix — 2026-03-29
VPS is NON-standalone deployment (public/ exists, no standalone/)
Static files ARE present (.next/static/chunks, css, hash-folder)
Now check: PM2 running? App responding?
"""
import paramiko
import os
import sys

VPS_HOST = "165.232.176.181"
VPS_USER = "root"

vps_pass_file = os.path.join(os.path.dirname(__file__), ".env.vps")
with open(vps_pass_file, "r") as f:
    VPS_PASS = f.read().strip()

def ssh_run(client, cmd, desc=""):
    if desc:
        print(f"\n>>> {desc}")
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    if out:
        # Strip box-drawing unicode chars that break Windows cp1252 terminal
        safe_out = out.encode("ascii", errors="replace").decode("ascii")
        print(safe_out)
    if err and "warning" not in err.lower():
        safe_err = err.encode("ascii", errors="replace").decode("ascii")
        print(f"STDERR: {safe_err[:300]}")
    return out, err

print(f"Connecting to {VPS_HOST}...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
print("Connected!")

# Check PM2
ssh_run(client, "pm2 list --no-color 2>&1 | head -20", "PM2 process list")

# Check if Next.js is listening on port 3000
ssh_run(client, "ss -tlnp | grep 3000 || echo 'Nothing on port 3000'", "Port 3000 check")

# Check Nginx is running
ssh_run(client, "systemctl is-active nginx", "Nginx status")

# Check .next/static structure
ssh_run(client, "find /root/aadesh-ai/.next/static -type f -name '*.js' 2>/dev/null | wc -l", "JS chunk count")
ssh_run(client, "du -sh /root/aadesh-ai/.next/static 2>/dev/null", "Static folder size")

# Check app directory
ssh_run(client, "ls /root/aadesh-ai/ | head -20", "App root directory")

# Quick curl test
ssh_run(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 'curl failed'", "HTTP status localhost:3000")

client.close()
print("\nDone.")
