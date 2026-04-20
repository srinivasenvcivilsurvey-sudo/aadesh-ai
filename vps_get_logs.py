import paramiko, sys

VPS_HOST = "165.232.176.181"
VPS_USER = "root"
with open("C:/Users/north/OneDrive/Attachments/Desktop/Banu/aadesh-ai/.env.vps") as f:
    VPS_PASS = f.read().strip()

c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=15)
print("Connected")

_, out, err = c.exec_command("pm2 logs aadesh-ai --lines 50 --nostream --no-color 2>&1")
logs = out.read().decode("utf-8", errors="replace")
errs = err.read().decode("utf-8", errors="replace")
c.close()

combined = logs + errs
print(combined[-3000:] if len(combined) > 3000 else combined)
