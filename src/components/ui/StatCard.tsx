import React from 'react';

type Props = {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  isDarkMode: boolean;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  isDarkMode,
}: Props) {
  return (
    <div
      className={`p-6 rounded-xl border flex items-center justify-between ${
        isDarkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div>
        <p
          className={`text-xs font-bold uppercase tracking-wider ${
            isDarkMode ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          {label}
        </p>
        <h3
          className={`text-3xl font-black mt-2 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}
        >
          {value}
        </h3>
      </div>

      <div
        className={`p-3 rounded-lg ${
          isDarkMode ? 'bg-slate-900' : bg
        }`}
      >
        <Icon size={24} className={color} />
      </div>
    </div>
  );
}
