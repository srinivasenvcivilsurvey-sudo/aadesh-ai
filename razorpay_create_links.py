"""
Create 4 Razorpay Payment Links for Aadesh AI pricing packs.
Reads RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from nextjs/.env.local
"""
import sys
import json
import base64
import urllib.request
import urllib.error
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── Read keys from .env.local ─────────────────────────────────────────────────
env_path = Path(__file__).parent / "nextjs" / ".env.local"
keys: dict[str, str] = {}
with open(env_path, encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, _, v = line.partition("=")
            keys[k.strip()] = v.strip()

KEY_ID = keys.get("RAZORPAY_KEY_ID", "")
KEY_SECRET = keys.get("RAZORPAY_KEY_SECRET", "")

if not KEY_ID or not KEY_SECRET or "placeholder" in KEY_ID or "placeholder" in KEY_SECRET:
    print("ERROR: Razorpay keys are placeholders or missing.")
    print(f"  RAZORPAY_KEY_ID    = {KEY_ID}")
    print(f"  RAZORPAY_KEY_SECRET= {KEY_SECRET[:10]}...")
    print()
    print("ACTION REQUIRED: Srinivas must add real Razorpay keys to:")
    print(f"  {env_path}")
    print()
    print("Steps:")
    print("  1. Login to razorpay.com → Settings → API Keys")
    print("  2. Copy Key ID and Key Secret")
    print("  3. Replace placeholder values in .env.local")
    print("  4. Re-run this script")
    sys.exit(1)

# ── Packs to create ───────────────────────────────────────────────────────────
PACKS = [
    {"id": "pack_a", "name": "Pack A", "amount": 99900,  "orders": 7,  "description": "Aadesh AI — Pack A (7 orders)"},
    {"id": "pack_b", "name": "Pack B", "amount": 199900, "orders": 18, "description": "Aadesh AI — Pack B (18 orders)"},
    {"id": "pack_c", "name": "Pack C", "amount": 349900, "orders": 32, "description": "Aadesh AI — Pack C (32 orders)"},
    {"id": "pack_d", "name": "Pack D", "amount": 599900, "orders": 55, "description": "Aadesh AI — Pack D (55 orders)"},
]

auth_bytes = base64.b64encode(f"{KEY_ID}:{KEY_SECRET}".encode()).decode()

results: list[dict] = []

for pack in PACKS:
    payload = json.dumps({
        "amount": pack["amount"],
        "currency": "INR",
        "description": pack["description"],
        "accept_partial": False,
        "reminder_enable": False,
        "notes": {
            "pack_id": pack["id"],
            "orders": str(pack["orders"]),
        },
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.razorpay.com/v1/payment_links",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Basic {auth_bytes}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        link_id = data.get("id", "")
        short_url = data.get("short_url", "")
        status = data.get("status", "")
        print(f"[OK] {pack['name']:6s} | {pack['amount']//100:>5} INR | {link_id} | {short_url}")
        results.append({
            "pack_id": pack["id"],
            "pack_name": pack["name"],
            "amount_paise": pack["amount"],
            "amount_inr": pack["amount"] // 100,
            "orders": pack["orders"],
            "link_id": link_id,
            "short_url": short_url,
            "status": status,
        })
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"[FAIL] {pack['name']:6s} | HTTP {e.code} | {body[:300]}")
        sys.exit(1)
    except Exception as exc:
        print(f"[FAIL] {pack['name']:6s} | {exc}")
        sys.exit(1)

# ── Print summary ─────────────────────────────────────────────────────────────
print()
print("=" * 60)
print("PAYMENT LINKS CREATED")
print("=" * 60)
for r in results:
    print(f"{r['pack_name']:6s} | ₹{r['amount_inr']:,} | {r['orders']} orders | {r['short_url']}")

# ── Save JSON for next step ────────────────────────────────────────────────────
out_path = Path(__file__).parent / "razorpay_links_result.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print()
print(f"Results saved to: {out_path}")
