'use client';

import React from 'react';
import { Field } from '@/lib/types';
import { useSatelliteAnalysis } from '@/hooks/useSatelliteAnalysis';
import { useFieldWeather } from '@/hooks/useFieldWeather';
import Link from 'next/link';

export default function DashboardFieldCard({ field }: { field: Field }) {
    const { analysis, loading: satelliteLoading } = useSatelliteAnalysis(field);
    const { weather, loading: weatherLoading } = useFieldWeather(field);

    // Helper for icon based on crop
    const isTree = field.crop?.match(/Tree|Wood|Sandalwood/i);
    const iconClass = isTree ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600';
    const statusClass = field.status === 'Healthy' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600';

    return (
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${iconClass}`}>
                        <span className="material-icons text-xl">agriculture</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{field.crop}</h3>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{field.name}</p>
                    </div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${statusClass}`}>{field.status}</span>
            </div>

            {/* Field Data Grid */}
            <div className="grid grid-cols-2 gap-2 my-3">
                {/* Weather (OpenWeather) */}
                {weather ? (
                    <div className="bg-orange-50 dark:bg-orange-900/10 p-2 rounded-xl border border-orange-100 dark:border-orange-800/30">
                        <span className="block text-[9px] uppercase tracking-wider text-orange-400 mb-0.5 font-bold flex items-center gap-1">
                            <span className="material-icons text-[9px]">thermostat</span> Weather
                        </span>
                        <div className="flex items-center gap-2">
                            <img src={`https://openweathermap.org/img/wn/${weather.icon}.png`} alt={weather.condition} className="w-6 h-6 -ml-1 -my-1" />
                            <span className="text-xs font-black text-orange-600">{weather.temp}°C</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-2 rounded-xl border border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center">
                        {weatherLoading ? <span className="material-icons animate-spin text-gray-300 text-xs">autorenew</span> : <span className="text-[9px] text-gray-300">No Weather</span>}
                    </div>
                )}

                {/* Soil Moisture (Satellite) */}
                {analysis ? (
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-2 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        <span className="block text-[9px] uppercase tracking-wider text-blue-400 mb-0.5 font-bold flex items-center gap-1">
                            <span className="material-icons text-[9px]">water_drop</span> Soil
                        </span>
                        <span className={`text-xs font-black ${analysis.soilMoisture > 30 ? 'text-blue-600' : 'text-amber-600'}`}>{analysis.soilMoisture}%</span>
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-2 rounded-xl border border-dashed border-gray-100 dark:border-gray-800 flex items-center justify-center">
                        {satelliteLoading ? <span className="material-icons animate-spin text-gray-300 text-xs">autorenew</span> : <span className="text-[9px] text-gray-300">No Satellite</span>}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-1 text-gray-400">
                    <span className="material-icons text-xs">straighten</span>
                    <span className="text-[10px] font-bold uppercase">{field.acres} Acres</span>
                </div>
                <Link href={`/fields`} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Details</Link>
            </div>
        </div>
    );
}
