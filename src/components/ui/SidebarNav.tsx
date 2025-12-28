import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, HardHat, Settings } from 'lucide-react';
import { ROUTES } from '../../router/routes';

type Item = {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const ITEMS: Item[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.projects, label: 'Job List', icon: HardHat },
  { to: ROUTES.settings, label: 'Settings', icon: Settings },
];

type Props = {
  isDarkMode: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
};

export function SidebarNav({ isDarkMode, collapsed = false, onToggleCollapsed }: Props) {
  const shell = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const itemBase = 'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors';
  const inactive = isDarkMode ? 'text-slate-400 hover:bg-slate-800/60' : 'text-slate-600 hover:bg-slate-50';
  const active = isDarkMode ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-orange-50 text-orange-700 border border-orange-100';

  return (
    <aside className={`h-full border-r ${shell} ${collapsed ? 'w-20' : 'w-64'} transition-all flex flex-col`}>
      <div className={`h-16 px-4 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="bg-orange-600 text-white w-9 h-9 rounded-lg flex items-center justify-center font-black">BM</div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-black uppercase tracking-tight">
                Builder<span className="text-orange-600">Mate</span>
              </div>
              <div className="text-[10px] opacity-60">Legacy build</div>
            </div>
          )}
        </div>
        {onToggleCollapsed && (
          <button
            onClick={onToggleCollapsed}
            className={`text-xs font-bold px-2 py-1 rounded ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '>' : '<'}
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `${itemBase} ${isActive ? active : inactive} ${collapsed ? 'justify-center' : ''}`
            }
          >
            <it.icon size={18} className={isDarkMode ? 'opacity-90' : 'opacity-80'} />
            {!collapsed && <span className="font-semibold">{it.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`p-3 border-t text-[10px] opacity-60 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        {!collapsed ? 'v0.1 • SPA routing' : 'v0.1'}
      </div>
    </aside>
  );
}
