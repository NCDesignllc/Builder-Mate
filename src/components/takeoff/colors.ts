// Simple color helpers for measurements/tags.
// Keeps everything optional/backwards compatible.
export const TAG_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-green-50 text-green-700 border-green-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-purple-50 text-purple-700 border-purple-200',
  'bg-rose-50 text-rose-700 border-rose-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'bg-lime-50 text-lime-700 border-lime-200',
  'bg-indigo-50 text-indigo-700 border-indigo-200',
] as const;

export type TagColorClass = typeof TAG_COLORS[number];

export function hashStringToIndex(s: string, mod: number) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return mod === 0 ? 0 : h % mod;
}

export function colorForTag(tag: string | null | undefined): TagColorClass {
  if (!tag) return 'bg-slate-50 text-slate-700 border-slate-200';
  const idx = hashStringToIndex(tag.toLowerCase().trim(), TAG_COLORS.length);
  return TAG_COLORS[idx];
}
