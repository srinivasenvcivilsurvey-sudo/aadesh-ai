"""TASK 1 + TASK 3 — Set LLM_PRIMARY=sarvam on VPS, restart PM2, verify, smoke test."""
import logging
import os
import time

import paramiko

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger(__name__)

VPS_HOST = "165.232.176.181"
VPS_USER = "root"

with open(os.path.join(os.path.dirname(__file__), ".env.vps"), "r") as f:
    VPS_PASS = f.read().strip()


def run(
    client: paramiko.SSHClient, cmd: str, label: str, timeout: int = 45
) -> str:
    log.info("\n=== %s ===", label)
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    body = out + ("\nSTDERR:\n" + err if err.strip() else "")
    safe = body.encode("ascii", errors="replace").decode("ascii")
    log.info(safe.strip())
    return out


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
log.info("Connected.")

# 0. Locate the actual app directory
run(client, "ls -la /root/aadesh-ai/nextjs/.env* 2>&1 | head -5", "locate .env files (nextjs dir)")
run(client, "ls -la /opt/aadesh-ai/nextjs/.env* 2>&1 | head -5", "locate .env files (opt dir)")
run(client, "pm2 describe aadesh-ai --no-color 2>&1 | grep -E 'exec cwd|script path' | head -5", "PM2 app cwd")

# TASK 1 — Append LLM_PRIMARY=sarvam idempotently to each candidate .env location
for path in (
    "/root/aadesh-ai/nextjs/.env",
    "/root/aadesh-ai/nextjs/.env.local",
    "/root/aadesh-ai/.env.local",
):
    cmd = (
        f"if [ -f {path} ]; then "
        f"  grep -q '^LLM_PRIMARY=' {path} && echo 'already set in {path}' "
        f"  || (echo 'LLM_PRIMARY=sarvam' >> {path} && echo 'added to {path}'); "
        f"else echo 'skip: {path} not found'; fi"
    )
    run(client, cmd, f"set LLM_PRIMARY in {path}")

run(client, "grep -H 'LLM_PRIMARY' /root/aadesh-ai/nextjs/.env* 2>&1", "verify file contents")

# Restart PM2 with --update-env so the process re-reads env
run(
    client,
    "cd /root/aadesh-ai && set -a && . ./nextjs/.env.local && set +a && pm2 restart aadesh-ai --update-env 2>&1 | tail -10",
    "pm2 restart --update-env",
    timeout=60,
)

log.info("\n=== waiting 6s for cold start ===")
time.sleep(6)

run(client, "pm2 list --no-color 2>&1 | head -10", "pm2 state post-restart")
run(
    client,
    "PID=$(pm2 pid aadesh-ai) && cat /proc/$PID/environ 2>/dev/null | tr '\\0' '\\n' | grep -E '^LLM_PRIMARY|^SARVAM' | sed 's/=.*/=<set>/'",
    "runtime env: LLM_PRIMARY + SARVAM_API_KEY visible to node",
)

run(client, "curl -s -o /dev/null -w 'HTTP %{http_code} | Total %{time_total}s\\n' --max-time 15 https://aadesh-ai.in/api/health", "health check")

# TASK 3 — Smoke test vision-read (expect non-500 response; body shows routing reached)
run(
    client,
    "curl -s -o /tmp/vr.out -w 'HTTP %{http_code} | Total %{time_total}s\\n' --max-time 30 "
    "-X POST https://aadesh-ai.in/api/pipeline/vision-read "
    "-H 'Content-Type: application/json' "
    "-d '{\"storagePath\":\"smoke-test-nonexistent.pdf\"}' ; "
    "echo '--- body (first 500 chars) ---' ; head -c 500 /tmp/vr.out ; echo",
    "smoke test POST /api/pipeline/vision-read",
    timeout=60,
)

run(
    client,
    "pm2 logs aadesh-ai --lines 100 --nostream --no-color 2>&1 | grep -E 'vision-read|Sarvam|LLM_PRIMARY|provider=' | tail -30",
    "vision-read/sarvam log trace",
)

client.close()
log.info("\nDone.")
