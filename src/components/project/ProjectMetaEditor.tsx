import React, { useMemo, useState } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';
import type { Project } from '../../lib/types';
import { formatMoney, parseMoney } from '../../lib/money';

type Props = {
  isDarkMode: boolean;
  project: Project;
  onUpdate: (patch: Partial<Pick<Project, 'status' | 'budget'>>) => void;
};

const STATUSES = ['Lead', 'Active', 'Closed'] as const;

export function ProjectMetaEditor({ isDarkMode, project, onUpdate }: Props) {
  const [open, setOpen] = useState(false);
  const [budgetEdit, setBudgetEdit] = useState(false);
  const [budgetText, setBudgetText] = useState(String(project.budget ?? 0));

  const statusCls = isDarkMode
    ? 'bg-slate-800 border-slate-700 text-slate-200'
    : 'bg-slate-100 border-slate-200 text-slate-700';

  const menuCls = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';

  const budgetLabel = useMemo(() => formatMoney(Number(project.budget ?? 0)), [project.budget]);

  const commitBudget = () => {
    const n = parseMoney(budgetText);
    onUpdate({ budget: n });
    setBudgetEdit(false);
    setOpen(false);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Status chip */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold shrink-0 flex items-center gap-1 ${statusCls}`}
        title="Edit status / budget"
      >
        {project.status || 'Lead'}
        <ChevronDown size={12} className="opacity-70" />
      </button>

      {/* Budget */}
      {!budgetEdit ? (
        <button
          onClick={() => {
            setBudgetText(String(project.budget ?? 0));
            setBudgetEdit(true);
            setOpen(true);
          }}
          className="text-xs opacity-70 hover:opacity-100 flex items-center gap-1"
          title="Edit budget"
        >
          Budget: {budgetLabel} <Pencil size={12} className="opacity-70" />
        </button>
      ) : null}

      {open && (
        <div className={`absolute left-0 top-7 w-56 rounded-lg border shadow-xl overflow-hidden z-50 ${menuCls}`}>
          <div className="px-3 py-2 text-xs font-bold uppercase opacity-70 border-b border-slate-700/30">
            Project Meta
          </div>

          {/* Status options */}
          <div className="px-2 py-2">
            <div className="text-[10px] font-bold uppercase opacity-60 mb-1">Status</div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    onUpdate({ status: s });
                    setOpen(false);
                  }}
                  className={`px-2 py-1 rounded text-xs font-bold border ${
                    project.status === s
                      ? 'bg-orange-600 text-white border-orange-600'
                      : isDarkMode
                      ? 'border-slate-700 hover:bg-slate-800'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Budget editor */}
          <div className="px-2 pb-3">
            <div className="text-[10px] font-bold uppercase opacity-60 mb-1">Budget</div>
            <div className="flex gap-2">
              <input
                value={budgetText}
                onChange={(e) => setBudgetText(e.target.value)}
                className={`flex-1 px-2 py-1 rounded border text-xs outline-none ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'
                }`}
                placeholder="25000"
              />
              <button
                onClick={commitBudget}
                className="px-3 py-1 rounded text-xs font-bold bg-orange-600 text-white hover:bg-orange-700"
              >
                Save
              </button>
            </div>
            <div className="text-[10px] opacity-60 mt-1">Accepts: 25000, $25,000, 25k</div>
          </div>

          <button
            onClick={() => {
              setBudgetEdit(false);
              setOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-xs opacity-70 hover:bg-orange-500/10 border-t border-slate-700/30"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
