import React, { useMemo } from 'react';
import { FileText, HardHat, TrendingUp, Volume2 } from 'lucide-react';
import type { Project, User } from '../lib/types';
import { StatCard } from '../components/ui/StatCard';
import { WeatherWidget } from '../components/ui/WeatherWidget';

type Props = {
  user: User | null;
  isDarkMode: boolean;
  projects: Project[];
  onSpeak: (text: string) => void;
};

export function DashboardPage({ user, isDarkMode, projects, onSpeak }: Props) {
  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status === 'Active').length;
    const pending = projects.filter((p) => p.status === 'Lead').length;
    const totalValue = projects.reduce((acc, p) => acc + Number(p.budget ?? 0), 0);
    return { active, pending, totalValue };
  }, [projects]);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex justify-between items-end border-b pb-4 border-slate-200/50">
        <div>
          <h2 className="text-3xl font-bold">Welcome, {user?.name ?? 'User'}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard isDarkMode={isDarkMode} label="Active Jobs" value={stats.active} icon={HardHat} color="text-blue-600" bg="bg-blue-50" />
        <StatCard isDarkMode={isDarkMode} label="Pending Quotes" value={stats.pending} icon={FileText} color="text-amber-600" bg="bg-amber-50" />
        <StatCard isDarkMode={isDarkMode} label="Pipeline" value={`$${stats.totalValue.toLocaleString()}`} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <WeatherWidget isDarkMode={isDarkMode} />
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold uppercase text-sm">Briefings</h3>
          {projects.filter((p) => p.aiPlan).slice(0, 2).map((p) => (
            <div key={p.id} className={`p-4 border rounded shadow-sm flex justify-between items-start ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <div>
                <h4 className="font-bold">{p.name}</h4>
                <p className="text-sm opacity-70 whitespace-pre-wrap">{p.aiPlan}</p>
              </div>
              <button onClick={() => onSpeak(p.aiPlan || '')} className="text-orange-600" title="Read aloud">
                <Volume2 size={18} />
              </button>
            </div>
          ))}
          {projects.filter((p) => p.aiPlan).length === 0 && (
            <div className="text-sm opacity-60">No briefings yet. Generate an AI plan from the Job List.</div>
          )}
        </div>
      </div>
    </div>
  );
}
