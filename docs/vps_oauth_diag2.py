"""Deeper OAuth diagnosis — reveal Supabase URL, test outbound reachability."""
import os
import paramiko

VPS_HOST = "165.232.176.181"
VPS_USER = "root"

with open(os.path.join(os.path.dirname(__file__), ".env.vps"), "r") as f:
    VPS_PASS = f.read().strip()


def run(client, cmd, label):
    print(f"\n=== {label} ===")
    _, stdout, stderr = client.exec_command(cmd, timeout=45)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    safe = (out + ("\nSTDERR:\n" + err if err.strip() else "")).encode("ascii", errors="replace").decode("ascii")
    print(safe.strip())


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
print("Connected.")

# Show the Supabase URL (not a secret, it's public anon config)
run(client, "grep '^NEXT_PUBLIC_SUPABASE_URL' /root/aadesh-ai/.env.local", "Supabase URL (app)")
run(client, "grep '^NEXT_PUBLIC_SUPABASE_URL' /root/aadesh-ai-src/nextjs/.env.local", "Supabase URL (src)")
run(client, "grep '^NEXT_PUBLIC_SITE_URL' /root/aadesh-ai/.env.local", "Site URL")

# List all env vars in .env.local (just keys, no values)
run(client, "grep -oE '^[A-Z_]+=' /root/aadesh-ai/.env.local | sort -u", "env var keys (app)")
run(client, "grep -oE '^[A-Z_]+=' /root/aadesh-ai-src/nextjs/.env.local | sort -u", "env var keys (src)")

# Test outbound HTTPS to Supabase + DNS
run(client, "SUPABASE_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL' /root/aadesh-ai/.env.local | cut -d'=' -f2-) && echo \"Testing: $SUPABASE_URL\" && curl -s -o /dev/null -w 'HTTP %{http_code} | DNS %{time_namelookup}s | Connect %{time_connect}s\\n' --max-time 10 \"$SUPABASE_URL\"", "Supabase reachability")
run(client, "SUPABASE_URL=$(grep '^NEXT_PUBLIC_SUPABASE_URL' /root/aadesh-ai/.env.local | cut -d'=' -f2-) && host $(echo $SUPABASE_URL | sed 's|https://||' | sed 's|/.*||')", "Supabase DNS")

# Test Google OAuth endpoint reachability
run(client, "curl -s -o /dev/null -w 'accounts.google.com HTTP %{http_code}\\n' --max-time 10 https://accounts.google.com", "Google OAuth reachability")

# Check if PM2 is actually getting env vars at runtime — inspect running process env
run(client, "PID=$(pm2 pid aadesh-ai) && cat /proc/$PID/environ 2>/dev/null | tr '\\0' '\\n' | grep -E 'SUPABASE|GOOGLE|NODE_ENV|NEXT_PUBLIC' | sed 's/=.*/=<set>/'", "runtime env vars")

# Check if dotenv is being loaded — look at standalone server.js start
run(client, "head -30 /root/aadesh-ai/server.js 2>&1", "server.js head")

# Check pm2 ecosystem config (how PM2 launches the app)
run(client, "cat /root/aadesh-ai/ecosystem.config.js 2>&1 || pm2 describe aadesh-ai --no-color 2>&1 | head -40", "PM2 config")

# Look at recent uninterrupted error stack
run(client, "pm2 logs aadesh-ai --lines 100 --nostream --no-color 2>&1 | grep -B1 -A5 'fetch failed' | tail -40", "fetch failed stack")

client.close()
print("\nDone.")
