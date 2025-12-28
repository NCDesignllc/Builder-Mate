import React from 'react';
import { Search } from 'lucide-react';
import { VoiceMicButton } from './VoiceMicButton';
import { WeatherWidget } from './WeatherWidget';

type Props = {
  value: string;
  onChange: (v: string) => void;
  isDarkMode: boolean;
  showWeather?: boolean;
};

export function AppHeaderSearch({ value, onChange, isDarkMode, showWeather = true }: Props) {
  const inputBg = isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800';
  return (
    <div className="flex items-center flex-1 max-w-xl space-x-4">
      <div className="relative w-full">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search jobs, clients, line items..."
          className={`w-full pl-10 py-2 text-sm rounded-lg border outline-none ${inputBg}`}
        />
        <div className="absolute right-2 top-2">
          <VoiceMicButton onResult={onChange} />
        </div>
      </div>
      {showWeather && <div className="hidden md:block"><WeatherWidget isDarkMode={isDarkMode} compact /></div>}
    </div>
  );
}
