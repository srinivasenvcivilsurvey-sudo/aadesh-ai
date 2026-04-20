"""
P0 Hotfix: nginx client_max_body_size 413 fix
SSH to VPS, find nginx config, add 30M limit, test, reload, verify.
"""
import paramiko
import time

HOST = "165.232.176.181"
USER = "root"
PASSWORD = "DonSeena@143143s"

def run(client, cmd, timeout=30):
    print(f"\n$ {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(out.rstrip())
    if err: print("[STDERR]", err.rstrip())
    return out, err

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, username=USER, password=PASSWORD, timeout=15)
print("✅ Connected to VPS")

# ── STEP 1: Find nginx config for aadesh-ai ─────────────────────────────────
print("\n═══ STEP 1: Find nginx config ═══")
out1, _ = run(client, "grep -rl 'aadesh-ai' /etc/nginx/ 2>/dev/null")
out2, _ = run(client, "ls /etc/nginx/sites-available/ 2>/dev/null; ls /etc/nginx/conf.d/ 2>/dev/null")

conf_path = None
# First try grep results (full paths)
for line in out1.splitlines():
    line = line.strip()
    if line and "aadesh-ai" in line:
        conf_path = line
        break

# Fallback: common paths
if not conf_path:
    for candidate in [
        "/etc/nginx/sites-available/aadesh-ai.in",
        "/etc/nginx/sites-available/aadesh-ai",
        "/etc/nginx/conf.d/aadesh-ai.conf",
        "/etc/nginx/conf.d/aadesh-ai.in.conf",
    ]:
        o, _ = run(client, f"test -f '{candidate}' && echo EXISTS || echo MISSING")
        if "EXISTS" in o:
            conf_path = candidate
            break

if not conf_path:
    print("❌ Could not find nginx config — listing all sites-available:")
    run(client, "ls -la /etc/nginx/sites-available/ 2>/dev/null")
    run(client, "ls -la /etc/nginx/conf.d/ 2>/dev/null")
    client.close()
    exit(1)

print(f"\n→ Config file: {conf_path}")

# ── STEP 2: Read current config + patch ─────────────────────────────────────
print("\n═══ STEP 2: Read current config ═══")
current, _ = run(client, f"cat '{conf_path}'")

print("\n─── Applying patch ───")
if "client_max_body_size" in current:
    print("⚠️  client_max_body_size already present — updating to 30M")
    run(client, f"sed -i 's/client_max_body_size[^;]*;/client_max_body_size 30M;/g' '{conf_path}'")
else:
    print("→ Inserting client_max_body_size 30M; after first 'server {' line")
    # Use Python over SSH to do the edit reliably (avoids shell escaping hell)
    patch_cmd = (
        "python3 -c \""
        "import re, sys; "
        "txt = open(sys.argv[1]).read(); "
        "patched = re.sub(r'(server\\s*\\{)', r'\\1\\n    client_max_body_size 30M;', txt, count=1); "
        "open(sys.argv[1], 'w').write(patched); "
        "print('PATCHED')\" "
        f"'{conf_path}'"
    )
    run(client, patch_cmd)

print("\n─── Config after patch ───")
patched, _ = run(client, f"cat '{conf_path}'")
print("\n─── Grep check ───")
run(client, f"grep -n 'client_max_body_size' '{conf_path}'")

# ── STEP 3: Test and reload nginx ────────────────────────────────────────────
print("\n═══ STEP 3: nginx -t + reload ═══")
test_out, test_err = run(client, "nginx -t 2>&1")
combined = test_out + test_err

if "successful" in combined or ("syntax is ok" in combined and "test is successful" in combined):
    print("✅ nginx config test PASSED")
    run(client, "systemctl reload nginx")
    time.sleep(2)
    status_out, _ = run(client, "systemctl is-active nginx")
    print(f"nginx status: {status_out.strip()}")
else:
    print("❌ nginx config test FAILED — rolling back")
    # Restore original
    restore_cmd = (
        "python3 -c \""
        "import sys; "
        "txt = open(sys.argv[1]).read(); "
        "import re; "
        "txt = re.sub(r'\\n\\s*client_max_body_size 30M;', '', txt); "
        "open(sys.argv[1], 'w').write(txt)\" "
        f"'{conf_path}'"
    )
    run(client, restore_cmd)
    print("Rolled back. nginx NOT reloaded.")
    client.close()
    exit(1)

# ── STEP 4: Verify 413 gone ──────────────────────────────────────────────────
print("\n═══ STEP 4: Verify 413 gone ═══")
verify_out, _ = run(
    client,
    "curl -s -o /dev/null -w '%{http_code}' -X POST "
    "-H 'Content-Length: 20000000' "
    "https://aadesh-ai.in/api/pipeline/validate",
    timeout=30
)
status_code = verify_out.strip()
print(f"\nHTTP status: {status_code}")
if "413" in status_code:
    print("❌ Still 413 — nginx may need full restart, or wrong config file")
else:
    print(f"✅ NOT 413 ({status_code}) — nginx accepted the size. Next.js handled it (expected 400/401/422).")

client.close()
print("\n✅ Script complete.")
print(f"\nSUMMARY:")
print(f"  conf_path = {conf_path}")
print(f"  http_status_after_fix = {status_code}")
print(f"  PATCHED_CONFIG:\n{patched}")
