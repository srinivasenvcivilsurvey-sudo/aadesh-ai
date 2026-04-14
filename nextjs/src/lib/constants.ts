// ── Pricing constants ─────────────────────────────────────────────────────────
// Single source of truth for cost calculations.
// Updated: 2026-04-14 — new pricing model (₹50/order safe cost)

export const COST_PER_ORDER_INR = 50;

export const PRICING = {
  pack_a: { name: 'Pack A', orders: 7,  priceInr: 999,  amountPaise: 99900 },
  pack_b: { name: 'Pack B', orders: 18, priceInr: 1999, amountPaise: 199900 },
  pack_c: { name: 'Pack C', orders: 32, priceInr: 3499, amountPaise: 349900 },
  pack_d: { name: 'Pack D', orders: 55, priceInr: 5999, amountPaise: 599900 },
} as const;

export type PackId = keyof typeof PRICING;
