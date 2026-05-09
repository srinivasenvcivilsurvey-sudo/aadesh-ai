"""
Phase 3 deploy — upload pre-built standalone, update env, restart PM2.
Build already done. This script skips rebuild.
"""
import os
import sys
import time
import paramiko
from pathlib import Path

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

VPS_HOST = "165.232.176.181"
VPS_USER = "root"
SCRIPT_DIR = Path(__file__).parent
NEXTJS_DIR = SCRIPT_DIR / "nextjs"

with open(SCRIPT_DIR / ".env.vps") as f:
    VPS_PASS = f.read().strip()

VPS_APP = "/root/aadesh-ai"


def run_vps(client, cmd, label, timeout=120):
    print(f"\n=== {label} ===")
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    combined = out + ("\nSTDERR: " + err if err.strip() else "")
    print(combined.strip()[:3000])
    return out


def upload_dir(sftp, local_dir: Path, remote_dir: str, depth=0):
    try:
        sftp.stat(remote_dir)
    except FileNotFoundError:
        sftp.mkdir(remote_dir)
    for item in local_dir.iterdir():
        remote_path = f"{remote_dir}/{item.name}"
        if item.is_dir():
            upload_dir(sftp, item, remote_path, depth + 1)
        else:
            sftp.put(str(item), remote_path)
    if depth == 0:
        print(f"  [OK] Uploaded {local_dir.name}")


standalone = NEXTJS_DIR / ".next" / "standalone"
static_dir = NEXTJS_DIR / ".next" / "static"
public_dir = NEXTJS_DIR / "public"

if not standalone.exists():
    print("[ERROR] .next/standalone not found — run npm run build first")
    raise SystemExit(1)

print("[OK] Found pre-built standalone")

# ── Connect to VPS ──────────────────────────────────────────────────────
print(f"\n=== Connecting to {VPS_HOST} ===")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
print("[OK] Connected")

# ── Update .env.local on VPS ────────────────────────────────────────────
print("\n=== Updating .env.local on VPS ===")
env_out = run_vps(client, f"cat {VPS_APP}/.env.local 2>&1", "Current .env.local")

env_updates = {
    "RAZORPAY_KEY_ID": "rzp_test_SdPnZFOlR5XkfV",
    "RAZORPAY_KEY_SECRET": "W5DCEt9gJcqo7hrfyAPdZ2vy",
    "RAZORPAY_WEBHOOK_SECRET": "AadeshWebhook2026",
}

for key, value in env_updates.items():
    if key in env_out:
        cmd = f"sed -i 's|^{key}=.*|{key}={value}|' {VPS_APP}/.env.local"
    else:
        cmd = f"echo '{key}={value}' >> {VPS_APP}/.env.local"
    run_vps(client, cmd, f"Set {key}")

run_vps(client, f"grep -E 'RAZORPAY' {VPS_APP}/.env.local", "Verify Razorpay vars")

# ── Upload standalone build ─────────────────────────────────────────────
print("\n=== Uploading build to VPS ===")
sftp = client.open_sftp()

print("  Uploading standalone...")
upload_dir(sftp, standalone, VPS_APP)

print("  Uploading static assets...")
run_vps(client, f"mkdir -p {VPS_APP}/.next/static", "mkdir static")
upload_dir(sftp, static_dir, f"{VPS_APP}/.next/static")

print("  Uploading public...")
run_vps(client, f"mkdir -p {VPS_APP}/public", "mkdir public")
upload_dir(sftp, public_dir, f"{VPS_APP}/public")

sftp.close()
print("[OK] Upload complete")

# ── Restart PM2 ─────────────────────────────────────────────────────────
run_vps(
    client,
    f"cd {VPS_APP} && set -a && . ./.env.local && set +a && pm2 restart aadesh-ai --update-env 2>&1",
    "PM2 restart",
    timeout=60,
)

print("\n=== Waiting 10s for cold start ===")
time.sleep(10)

# ── Verify ──────────────────────────────────────────────────────────────
run_vps(client, "pm2 list --no-color 2>&1 | head -20", "PM2 state")
run_vps(
    client,
    'curl -s -o /dev/null -w "HTTP %{http_code} | %{time_total}s\\n" --max-time 20 https://aadesh-ai.in/api/health',
    "Health check",
)
run_vps(
    client,
    "pm2 logs aadesh-ai --lines 15 --nostream --no-color 2>&1 | tail -20",
    "Recent logs",
)

client.close()
print("\n[DONE] Phase 3 deploy complete. Live at https://aadesh-ai.in")
