import React from 'react';
import { getWeather } from '@/lib/data';

export default async function WeatherWidget() {
  const weather = await getWeather();

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-0 rounded-3xl shadow-xl shadow-blue-500/20 relative overflow-hidden group h-full min-h-[160px] flex flex-col justify-between text-white">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full -ml-10 -mb-10 blur-xl pointer-events-none"></div>

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 border border-white/10">
            <span className="material-icons">wb_sunny</span>
          </div>
          {weather.alert && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <span className="material-icons text-[12px]">warning</span>
              <span className="uppercase tracking-tighter">{weather.alert.type}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tighter">{weather.temp}°</span>
            <span className="text-sm font-bold uppercase tracking-widest opacity-80">{weather.condition}</span>
          </div>

          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="material-icons text-[14px]">water_drop</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-80">
              <span className="material-icons text-[14px]">air</span>
              <span className="text-[10px] font-bold tracking-widest uppercase">{weather.windSpeed} mph</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
