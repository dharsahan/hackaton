'use client';

import React, { useState, useMemo } from 'react';
import { YieldData } from '@/lib/types';

interface YieldSummaryCardClientProps {
    initialHistory: YieldData[];
}

type Period = 'Yearly' | 'Seasonal' | 'Monthly';

export default function YieldSummaryCardClient({ initialHistory }: YieldSummaryCardClientProps) {
    const [activePeriod, setActivePeriod] = useState<Period>('Yearly');

    const { chartData, yieldChange, totalYield, isPositive, unit } = useMemo(() => {
        let data: number[] = [];
        let current = 0;
        let previous = 0;
        let total = 0;
        let u = 'Quintals';

        if (activePeriod === 'Yearly') {
            // Use actual history or fallback
            data = initialHistory.length > 0
                ? initialHistory.map(h => h.yield)
                : [120, 132, 101, 134, 190, 230, 210];

            const last = initialHistory[initialHistory.length - 1];
            const prev = initialHistory[initialHistory.length - 2];
            current = last?.yield || 0;
            previous = prev?.yield || 0;
            total = current * 1240; // Mock calculation matching original
        } else if (activePeriod === 'Seasonal') {
            // Mock Seasonal Data (Spring, Summer, Autumn, Winter)
            data = [180, 240, 210, 150, 190, 250, 220, 160]; // 2 years of seasons
            current = 220; // Autumn
            previous = 250; // Summer
            total = current * 300; // Smaller scale for season
            u = 'Quintals';
        } else {
            // Mock Monthly Data
            data = [18, 20, 22, 25, 28, 30, 32, 30, 28, 25, 22, 20];
            current = 20;
            previous = 22;
            total = current * 100;
            u = 'Quintals';
        }

        // Ensure enough points for curve
        if (data.length < 5) data.push(...[180, 220, 200, 240]);

        const change = previous ? ((current - previous) / previous) * 100 : 12.5;

        return {
            chartData: data,
            yieldChange: change,
            totalYield: total,
            isPositive: change >= 0,
            unit: u
        };
    }, [activePeriod, initialHistory]);

    // Chart generation logic
    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const range = max - min || 1;

    const points = chartData.map((val, i) => {
        const x = (i / (chartData.length - 1)) * 100;
        const y = 50 - ((val - min) / range) * 40; // 50 is height
        return `${x},${y}`;
    }).join(' L');

    const areaPath = `M0,50 L${points} L100,50 Z`;
    const linePath = `M${points}`;

    const periods: Period[] = ['Yearly', 'Seasonal', 'Monthly'];

    return (
        <div className="bg-white dark:bg-[#1e293b] p-0 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group h-full min-h-[160px] flex flex-col justify-between transition-all duration-300 hover:border-primary/30">
            {/* Background Chart */}
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 pointer-events-none">
                <svg className="w-full h-full transition-all duration-500 ease-in-out" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <defs>
                        <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#yieldGrad)" className="transition-all duration-500 ease-in-out" />
                    <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" className="transition-all duration-500 ease-in-out" />
                </svg>
            </div>

            <div className="p-6 relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        {periods.map(p => (
                            <button
                                key={p}
                                onClick={() => setActivePeriod(p)}
                                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all duration-200 ${activePeriod === p
                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${isPositive ? 'text-[#10b981] bg-[#10b981]/10' : 'text-red-500 bg-red-500/10'}`}>
                        <span className="material-icons text-[12px]">{isPositive ? 'trending_up' : 'trending_down'}</span>
                        {Math.abs(yieldChange).toFixed(1)}%
                    </div>
                </div>

                <div className="mt-auto">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Est. Yield</p>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{Math.round(totalYield / 100)}k</span>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{unit}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
