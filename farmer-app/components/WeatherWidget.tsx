import React from 'react';
import { getWeather } from '@/lib/data';

export default async function WeatherWidget() {
  const weather = await getWeather();

  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
      {/* Weather Alert */}
      {weather.alert && (
        <div className="flex items-center gap-1.5 mb-3 text-ochre">
          <span className="material-icons text-[14px]">warning_amber</span>
          <span className="text-xs font-medium">{weather.alert.type}</span>
        </div>
      )}
      <div className="flex items-center gap-4">
        <span className="material-icons text-4xl text-gray-300 dark:text-gray-600">partly_cloudy_day</span>
        <div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{weather.temp}°F</div>
          <div className="text-sm text-gray-400">{weather.condition}</div>
          <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <span className="material-icons text-[12px]">water_drop</span> {weather.humidity}%
          </div>
        </div>
      </div>
    </div>
  );
}
