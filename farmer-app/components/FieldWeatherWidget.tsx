'use client';

import React from 'react';
import { Field } from '@/lib/types';
import { useFieldWeather } from '@/hooks/useFieldWeather';

export default function FieldWeatherWidget({ field }: { field: Field }) {
    const { weather, loading } = useFieldWeather(field);

    if (loading) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center h-full min-h-[50px]">
                <span className="material-icons animate-spin text-gray-300 text-xs">autorenew</span>
            </div>
        );
    }

    if (!weather) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl border border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center h-full min-h-[50px]">
                <span className="text-[9px] text-gray-300">No Weather</span>
            </div>
        );
    }

    return (
        <div className="bg-orange-50 dark:bg-orange-900/10 p-2.5 rounded-xl border border-orange-100 dark:border-orange-800/40 h-full">
            <span className="block text-[10px] uppercase tracking-wider text-orange-400 mb-1 font-semibold flex items-center gap-1">
                <span className="material-icons text-[10px]">thermostat</span> Weather
            </span>
            <div className="flex items-center gap-1.5">
                <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt={weather.condition} className="w-6 h-6 -ml-1 -my-1" />
                <span className="text-xs font-bold text-orange-600">{weather.temp}°C</span>
            </div>
            <p className="text-[9px] text-orange-400/80 font-medium truncate mt-0.5">{weather.condition}</p>
        </div>
    );
}
