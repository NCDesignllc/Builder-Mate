import type { EstimateItem } from './types';

/**
 * Gemini returns JSON like: [{description, type, quantity, rate}, ...]
 * We normalize types, numbers, and add stable unique ids.
 */
export function normalizeAiItems(raw: any): EstimateItem[] {
  if (!Array.isArray(raw)) return [];
  const now = Date.now();

  return raw
    .map((r, idx) => ({
      id: `${now}-${idx}-${Math.floor(Math.random() * 1e6)}`,
      description: String(r?.description ?? '').trim(),
      type: String(r?.type ?? 'Material').trim() || 'Material',
      quantity: toNumber(r?.quantity, 1),
      rate: toNumber(r?.rate, 0),
    }))
    .filter((x) => x.description.length > 0);
}

function toNumber(v: any, fallback: number) {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').trim());
  return Number.isFinite(n) ? n : fallback;
}
