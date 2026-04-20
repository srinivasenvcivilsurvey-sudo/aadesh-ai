"""
Git pull deploy — pulls latest from GitHub on VPS, builds, copies standalone, restarts PM2.
2026-04-16 — for 2-commit catchup
"""
import paramiko, sys, time
from pathlib import Path

HOST = "165.232.176.181"
USER = "root"
PASS = open(Path(__file__).parent / ".env.vps").read().strip()

CMDS = [
    ("git stash", "cd /root/aadesh-ai-src && git stash 2>&1", 30),
    ("git pull", "cd /root/aadesh-ai-src/nextjs && git pull origin main 2>&1", 60),
    ("npm install", "cd /root/aadesh-ai-src/nextjs && npm ci --prefer-offline 2>&1 | tail -5", 180),
    ("npm build", "cd /root/aadesh-ai-src/nextjs && npm run build 2>&1 | tail -20", 300),
    ("copy standalone", "cp -r /root/aadesh-ai-src/nextjs/.next/standalone/. /root/aadesh-ai/", 30),
    ("copy static", "cp -r /root/aadesh-ai-src/nextjs/.next/static /root/aadesh-ai/.next/static 2>&1", 30),
    ("copy public", "cp -r /root/aadesh-ai-src/nextjs/public /root/aadesh-ai/public 2>&1", 30),
    ("pm2 restart", "pm2 restart aadesh-ai --update-env 2>&1 | cat", 30),
    ("pm2 status", "pm2 list --no-color 2>&1", 15),
    ("health check", "sleep 3 && curl -s -o /dev/null -w '%{http_code}' https://aadesh-ai.in/api/health", 20),
]

def safe(s):
    return s.encode("ascii", errors="replace").decode("ascii") if s else ""

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print(f"Connecting to {HOST}...")
client.connect(HOST, username=USER, password=PASS, timeout=30)
print("Connected.\n")

results = {}
for name, cmd, timeout in CMDS:
    print(f"\n=== {name} ===")
    print(f"$ {cmd[:80]}")
    _, stdout, stderr = client.exec_command(f"bash -l -c '{cmd}'", timeout=timeout)
    out = safe(stdout.read().decode("utf-8", errors="replace"))
    err = safe(stderr.read().decode("utf-8", errors="replace"))
    rc = stdout.channel.recv_exit_status()
    print(f"exit: {rc}")
    if out.strip():
        print(out[-2000:])
    if err.strip() and rc != 0:
        print("ERR:", err[-500:])
    results[name] = rc
    if rc != 0 and name in ("git stash", "git pull", "npm build", "copy standalone"):
        print(f"CRITICAL FAILURE in {name} — stopping deploy")
        break

client.close()
print("\n=== SUMMARY ===")
for name, rc in results.items():
    print(f"{'OK  ' if rc == 0 else 'FAIL'} {name} (exit {rc})")
