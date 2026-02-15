import React from 'react';
import { getWeather } from '@/lib/data';

export default async function WeatherWidget() {
  const weather = await getWeather();

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between group hover:border-blue-400/30 transition-all duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
          <span className="material-icons">wb_sunny</span>
        </div>
        {weather.alert && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
            <span className="material-icons text-[12px]">warning</span>
            <span className="uppercase tracking-tighter">{weather.alert.type}</span>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{weather.temp}°</span>
          <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">{weather.condition}</span>
        </div>
        
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1 text-gray-400">
            <span className="material-icons text-[14px]">water_drop</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <span className="material-icons text-[14px]">air</span>
            <span className="text-[10px] font-bold tracking-widest uppercase">{weather.windSpeed} mph</span>
          </div>
        </div>
      </div>
    </div>
  );
}
