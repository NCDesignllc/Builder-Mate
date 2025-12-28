import React, { useMemo } from 'react';
import { Calendar, Wand2 } from 'lucide-react';
import type { Project, User } from '../lib/types';
import { useOpenProject } from '../hooks/useOpenProject';

type Props = {
  user: User | null;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  projects: Project[];
  onGeneratePlan: (projectId: string) => void;

  /** Called before navigation to prime store state (activeProjectId, estimateItems). */
  onPrimeOpenProject: (projectId: string) => void;

  searchQuery: string;
  setSearchQuery: (v: string) => void;
};

export function ProjectsPage({
  isDarkMode,
  projects,
  onGeneratePlan,
  onPrimeOpenProject,
  searchQuery,
}: Props) {
  const openProject = useOpenProject(onPrimeOpenProject);

  const filtered = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return projects;
    return projects.filter((p) =>
      [p.name, p.client, p.status].some((x) => String(x ?? '').toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  const th = `px-4 py-3 text-[11px] font-semibold uppercase border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`;
  const td = `px-4 py-4 text-sm border-b align-middle ${isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end pb-2 border-b">
        <h2 className="text-2xl font-bold">Job List</h2>
        <div className="text-xs opacity-60">{filtered.length} jobs</div>
      </div>

      <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className={th}>Name</th>
              <th className={th}>Status</th>
              <th className={`${th} text-right`}>Total</th>
              <th className={th}>Next</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody className={isDarkMode ? 'divide-slate-700' : 'divide-slate-100'}>
            {filtered.map((p) => (
              <tr
                key={p.id}
                onClick={() => openProject(p.id)}
                className={`cursor-pointer ${isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}
              >
                <td className={td}>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-xs opacity-60">{p.client}</div>
                </td>
                <td className={td}>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${isDarkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className={`${td} text-right font-mono`}>${Number(p.budget ?? 0).toLocaleString()}</td>
                <td className={td}>
                  <div className="flex items-center text-xs">
                    <Calendar size={12} className="mr-1" />
                    {p.nextActivity || '-'}
                  </div>
                </td>
                <td className={td}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGeneratePlan(p.id);
                    }}
                    className="hover:text-orange-600"
                    title="Generate AI plan"
                  >
                    <Wand2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className={td} colSpan={5}>
                  No jobs match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
