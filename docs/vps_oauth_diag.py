"""Diagnose Gmail/Google OAuth on VPS — logs, env vars, callback route."""
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
    safe = out + ("\nSTDERR:\n" + err if err.strip() else "")
    print(safe.encode("ascii", errors="replace").decode("ascii").strip())


client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
print("Connected.")

# PM2 logs filtered for auth
run(client, "pm2 logs aadesh-ai --lines 80 --nostream --no-color 2>&1 | grep -iE 'oauth|auth|google|callback|redirect|error' | tail -40", "PM2 auth logs (filtered)")

# Full recent logs
run(client, "pm2 logs aadesh-ai --lines 40 --nostream --no-color 2>&1 | tail -40", "PM2 logs (last 40)")

# Env file (mask secrets)
run(client, "grep -iE 'google|oauth|nextauth|supabase|site|redirect' /root/aadesh-ai-src/nextjs/.env.local 2>&1 | sed 's/=.*/=<set>/'", "src/.env.local (masked)")
run(client, "grep -iE 'google|oauth|nextauth|supabase|site|redirect' /root/aadesh-ai/.env.local 2>&1 | sed 's/=.*/=<set>/'", "app/.env.local (masked)")

# Also reveal exact redirect URLs (not secret — just URLs)
run(client, "grep -iE 'REDIRECT|NEXTAUTH_URL|SITE_URL|NEXT_PUBLIC_SITE_URL' /root/aadesh-ai-src/nextjs/.env.local 2>&1", "URL env vars (src)")
run(client, "grep -iE 'REDIRECT|NEXTAUTH_URL|SITE_URL|NEXT_PUBLIC_SITE_URL' /root/aadesh-ai/.env.local 2>&1", "URL env vars (app)")

# Curl the callback route
run(client, "curl -s -o /dev/null -w 'HTTP %{http_code}\\n' https://aadesh-ai.in/auth/callback", "callback HTTP code")
run(client, "curl -s https://aadesh-ai.in/auth/callback 2>&1 | head -30", "callback body")

# Try a sample Google auth flow init (what the browser hits)
run(client, "curl -sI https://aadesh-ai.in/auth/login | head -10", "login page headers")

# Look at the auth callback source
run(client, "find /root/aadesh-ai/src -path '*auth/callback*' -o -path '*auth/sso*' 2>&1 | head -10", "callback source files")
run(client, "find /root/aadesh-ai-src/nextjs/src -path '*auth/callback*' 2>&1 | head -10", "callback source (src)")

client.close()
print("\nDone.")
