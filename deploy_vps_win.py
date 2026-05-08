"""
deploy_vps_win.py — Windows deploy script for Aadesh AI VPS.

Reads VPS_PASS from D:\\AIProjects\\.env via python-dotenv, SSH connects to
165.232.176.181 as root with paramiko, runs git pull + npm install + npm
run build + pm2 restart, streams output, then health-checks port 3000.

Run:    python deploy_vps_win.py
Deps:   pip install paramiko python-dotenv
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

try:
    import paramiko
except ImportError:
    sys.stderr.write("paramiko not installed. Run: pip install paramiko\n")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    sys.stderr.write("python-dotenv not installed. Run: pip install python-dotenv\n")
    sys.exit(1)


VPS_HOST = "165.232.176.181"
VPS_USER = "root"
ENV_PATH = Path(r"D:\AIProjects\.env")
APP_DIR = "/root/aadesh-ai"
NEXTJS_DIR = "/root/aadesh-ai/nextjs"

DEPLOY_STEPS: list[tuple[str, str]] = [
    ("git pull", f"cd {APP_DIR} && git pull origin main"),
    ("npm install", f"cd {NEXTJS_DIR} && npm install --production=false"),
    ("npm run build", f"cd {NEXTJS_DIR} && npm run build"),
    ("pm2 restart", "pm2 restart aadesh-ai --update-env"),
    ("pm2 save", "pm2 save"),
]

HEALTH_CMD = "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000"


def load_password() -> str:
    if not ENV_PATH.exists():
        raise SystemExit(f"❌ FAILED: env file missing: {ENV_PATH}")
    load_dotenv(dotenv_path=ENV_PATH)
    pwd = os.environ.get("VPS_PASS")
    if not pwd:
        raise SystemExit(f"❌ FAILED: VPS_PASS not set in {ENV_PATH}")
    return pwd


def stream_command(client: paramiko.SSHClient, label: str, cmd: str) -> int:
    print(f"\n=== {label} ===\n$ {cmd}", flush=True)
    _stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    _stdin.close()
    channel = stdout.channel
    while True:
        if channel.recv_ready():
            chunk = channel.recv(4096).decode("utf-8", errors="replace")
            sys.stdout.write(chunk)
            sys.stdout.flush()
        if channel.recv_stderr_ready():
            chunk = channel.recv_stderr(4096).decode("utf-8", errors="replace")
            sys.stderr.write(chunk)
            sys.stderr.flush()
        if (
            channel.exit_status_ready()
            and not channel.recv_ready()
            and not channel.recv_stderr_ready()
        ):
            break
    exit_code = channel.recv_exit_status()
    drain_out = stdout.read().decode("utf-8", errors="replace")
    drain_err = stderr.read().decode("utf-8", errors="replace")
    if drain_out:
        sys.stdout.write(drain_out)
    if drain_err:
        sys.stderr.write(drain_err)
    return exit_code


def health_check(client: paramiko.SSHClient) -> str:
    print("\n=== health check ===\n$ " + HEALTH_CMD, flush=True)
    _stdin, stdout, stderr = client.exec_command(HEALTH_CMD)
    _stdin.close()
    code = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    if err:
        sys.stderr.write(err + "\n")
    return code


def main() -> int:
    password = load_password()

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"connecting to {VPS_USER}@{VPS_HOST} ...", flush=True)
    client.connect(
        hostname=VPS_HOST, username=VPS_USER, password=password, timeout=30
    )

    try:
        for label, cmd in DEPLOY_STEPS:
            rc = stream_command(client, label, cmd)
            if rc != 0:
                print(f"\n❌ FAILED: step '{label}' exited {rc}", flush=True)
                return 1

        http_code = health_check(client)
        print(f"\nHTTP status: {http_code}", flush=True)
        if http_code == "200":
            print("\n✅ DEPLOYED", flush=True)
            return 0
        print(f"\n❌ FAILED: health check returned {http_code or '(empty)'}", flush=True)
        return 2
    finally:
        client.close()


if __name__ == "__main__":
    sys.exit(main())
