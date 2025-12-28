export type CsvRow = Record<string, any>;

/** Basic CSV escape */
function esc(v: any): string {
  const s = String(v ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Convert array of objects to CSV string (headers derived from union of keys). */
export function toCsv(rows: CsvRow[]): string {
  if (!rows?.length) return '';
  const headers = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r || {}).forEach((k) => set.add(k));
      return set;
    }, new Set<string>())
  );

  const lines = [
    headers.map(esc).join(','),
    ...rows.map((r) => headers.map((h) => esc(r?.[h])).join(',')),
  ];

  return lines.join('\n');
}

export function downloadText(filename: string, text: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}
