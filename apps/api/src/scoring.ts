// Default scoring: 4 categories x 1–5 → total 4–20 → tiered points
export function computePoints(scores: Record<string, number>, weights?: Record<string, number>) {
  let total = 0;
  let weightedMax = 0;
  for (const [cat, val] of Object.entries(scores)) {
    const w = weights?.[cat] ?? 1;
    total += (val ?? 0) * w;
    weightedMax += 5 * w;
  }
  // Tiered mapping roughly like: 80%+ → 5 pts, 55–79% → 3, 30–54% → 1, else 0
  const pct = weightedMax ? total / weightedMax : 0;
  let base = 0;
  if (pct >= 0.8) base = 5;
  else if (pct >= 0.55) base = 3;
  else if (pct >= 0.3) base = 1;
  return { total, base };
}