import React, { useMemo, useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import type { EstimateItem, Project } from '../../lib/types';
import { downloadText, toCsv } from '../../lib/csv';

type Props = {
  isDarkMode: boolean;
  project: Project;
  items: EstimateItem[];
};

export function ExportMenu({ isDarkMode, project, items }: Props) {
  const [open, setOpen] = useState(false);

  const rows = useMemo(() => {
    return (items || []).map((i) => ({
      description: i.description ?? '',
      type: i.type ?? '',
      quantity: Number(i.quantity ?? 0),
      rate: Number(i.rate ?? 0),
      total: Number(i.quantity ?? 0) * Number(i.rate ?? 0),
    }));
  }, [items]);

  const btnCls = isDarkMode
    ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
    : 'border-slate-200 hover:bg-slate-50 text-slate-700';

  const menuCls = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';

  const exportCsv = () => {
    const csv = toCsv(rows);
    downloadText(`${project.name || 'estimate'}-estimate.csv`, csv, 'text/csv');
    setOpen(false);
  };

  const exportJson = () => {
    downloadText(
      `${project.name || 'estimate'}-estimate.json`,
      JSON.stringify({ project, items }, null, 2),
      'application/json'
    );
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`px-3 py-2 rounded text-xs font-bold flex items-center gap-2 border ${btnCls}`}
        title="Export"
      >
        <Download size={14} className="text-orange-600" />
        Export
        <ChevronDown size={14} className="opacity-70" />
      </button>

      {open && (
        <div className={`absolute right-0 mt-2 w-44 rounded-lg border shadow-xl overflow-hidden z-50 ${menuCls}`}>
          <button onClick={exportCsv} className={`w-full text-left px-3 py-2 text-xs hover:bg-orange-500/10`}>
            Export CSV
          </button>
          <button onClick={exportJson} className={`w-full text-left px-3 py-2 text-xs hover:bg-orange-500/10`}>
            Export JSON
          </button>
          <button onClick={() => setOpen(false)} className={`w-full text-left px-3 py-2 text-xs opacity-70 hover:bg-orange-500/10`}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}
