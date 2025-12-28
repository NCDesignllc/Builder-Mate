import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { User } from '../lib/types';

type Props = {
  user: User | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
};

export function SettingsPage({ user, isDarkMode, onToggleDarkMode, onLogout }: Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold border-b pb-4 flex items-center gap-2">
        <ShieldCheck size={20} className="text-orange-600" /> Settings
      </h2>

      <div className={`border rounded-lg p-6 flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h4 className="font-bold">Dark Mode</h4>
          <p className="text-xs opacity-60">Visual theme</p>
        </div>
        <button onClick={onToggleDarkMode} className="bg-slate-200/30 px-4 py-1 rounded-full text-xs font-bold">
          {isDarkMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className={`border rounded-lg p-6 flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div>
          <h4 className="font-bold">Account</h4>
          <p className="text-xs opacity-60">Signed in as {user?.name ?? 'User'}</p>
        </div>
        <button onClick={onLogout} className="text-red-600 font-bold text-xs">
          Logout
        </button>
      </div>

      <div className="text-xs opacity-60">
        Auth hardening: user + projects are now persisted to <code>localStorage</code> via Zustand persist middleware.
      </div>
    </div>
  );
}
