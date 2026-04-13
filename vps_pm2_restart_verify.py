"""Restart PM2 with --update-env after Supabase restore, then verify OAuth is alive."""
import os
import time
import paramiko

VPS_HOST = "165.232.176.181"
VPS_USER = "root"

with open(os.path.join(os.path.dirname(__file__), ".env.vps"), "r") as f:
    VPS_PASS = f.read().strip()


def run(client: paramiko.SSHClient, cmd: str, label: str, timeout: int = 45) -> str:
    print(f"\n=== {label} ===")
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    safe = (out + ("\nSTDERR:\n" + err if err.strip() else "")).encode("ascii", errors="replace").decode("ascii")
    print(safe.strip())
    return out


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
print("Connected.")

# 1. Show current PM2 state before restart
run(client, "pm2 list --no-color 2>&1 | head -20", "PM2 state before")

# 2. Re-verify DNS from VPS — Supabase should now resolve
run(client, "host uyxkjhzaqmzoqvjodhcb.supabase.co 2>&1", "DNS check (should resolve now)")
run(client, "curl -s -o /dev/null -w 'HTTP %{http_code} | DNS %{time_namelookup}s | Connect %{time_connect}s\\n' --max-time 10 https://uyxkjhzaqmzoqvjodhcb.supabase.co/auth/v1/health", "Supabase auth/v1/health")

# 3. Source .env.local and restart PM2 with --update-env so server-side vars are also loaded
# This addresses both: clearing error backlog AND the secondary runtime-env-vars issue
run(client,
    "cd /root/aadesh-ai && set -a && . ./.env.local && set +a && pm2 restart aadesh-ai --update-env 2>&1 | tail -15",
    "PM2 restart with updated env",
    timeout=60)

# 4. Wait a few seconds for cold start
print("\n=== waiting 6s for cold start ===")
time.sleep(6)

# 5. Confirm PM2 is online, no crashes
run(client, "pm2 list --no-color 2>&1 | head -20", "PM2 state after")
run(client, "pm2 describe aadesh-ai --no-color 2>&1 | grep -E 'status|uptime|restarts|memory' | head -10", "PM2 describe")

# 6. Verify runtime env vars are NOW visible to the node process
run(client, "PID=$(pm2 pid aadesh-ai) && cat /proc/$PID/environ 2>/dev/null | tr '\\0' '\\n' | grep -E 'SUPABASE|GOOGLE|NODE_ENV|NEXT_PUBLIC' | sed 's/=.*/=<set>/' | sort -u", "runtime env vars (should show SUPABASE_*)")

# 7. Hit health endpoint
run(client, "curl -s -o /dev/null -w 'HTTP %{http_code} | Total %{time_total}s\\n' --max-time 15 https://aadesh-ai.in/api/health", "aadesh-ai.in /api/health")
run(client, "curl -s -o /dev/null -w 'HTTP %{http_code} | Total %{time_total}s\\n' --max-time 15 https://aadesh-ai.in/", "aadesh-ai.in /")
run(client, "curl -s -o /dev/null -w 'HTTP %{http_code} | Total %{time_total}s\\n' --max-time 15 https://aadesh-ai.in/auth/login", "aadesh-ai.in /auth/login")

# 8. Tail logs for any fetch failures in the last 30 lines
run(client, "pm2 logs aadesh-ai --lines 40 --nostream --no-color 2>&1 | tail -50", "PM2 logs tail")
run(client, "pm2 logs aadesh-ai --lines 200 --nostream --no-color 2>&1 | grep -c 'fetch failed' || echo '0'", "fetch failed count (post-restart logs)")

client.close()
print("\nDone.")
