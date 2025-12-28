export function formatMoney(n: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n || 0);
  } catch {
    return `$${Number(n || 0).toLocaleString()}`;
  }
}

/** Accepts "$12,345", "12345", "12.3k" */
export function parseMoney(input: string): number {
  const s = String(input ?? '').trim().toLowerCase();
  if (!s) return 0;

  const mult = s.endsWith('k') ? 1_000 : s.endsWith('m') ? 1_000_000 : 1;
  const cleaned = s.replace(/[^0-9.\-]/g, '').replace(/(\..*)\./g, '$1');
  const num = Number(cleaned);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * mult);
}
