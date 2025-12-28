import React from 'react';
import { Cloud, Droplets, Sun, Wind } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';

type Props = {
  isDarkMode: boolean;
  compact?: boolean;
  lat?: number;
  lon?: number;
};

export function WeatherWidget({ isDarkMode, compact = false, lat = 37.7749, lon = -122.4194 }: Props) {
  const { weather, loading } = useWeather(lat, lon);

  if (loading) {
    return <div className="h-8 w-24 bg-slate-200/50 rounded animate-pulse" />;
  }
  if (!weather) return null;

  const Icon = weather.weathercode <= 3 ? Sun : weather.weathercode <= 60 ? Cloud : Droplets;
  const iconColor = weather.weathercode <= 3 ? 'text-amber-500' : weather.weathercode <= 60 ? 'text-slate-400' : 'text-blue-500';

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
        <Icon className={iconColor} size={16} />
        <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{weather.temperature}°C</span>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border h-full ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-bold text-sm uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Site Conditions</h3>
        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse mr-1.5" />
          Live
        </span>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center space-x-4">
          <Icon className={iconColor} size={24} />
          <div>
            <div className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{weather.temperature}°</div>
            <div className={`text-xs font-medium uppercase tracking-wide mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Real Feel</div>
          </div>
        </div>

        <div className="text-right">
          <div className={`flex items-center justify-end font-bold text-lg ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            <Wind size={18} className="mr-2 text-slate-400" />
            {weather.windspeed} <span className="text-xs ml-1 font-normal text-slate-400">km/h</span>
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wide mt-1">Wind Speed</div>
        </div>
      </div>
    </div>
  );
}
