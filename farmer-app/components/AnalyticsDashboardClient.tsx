'use client';

import React, { useState, useMemo } from 'react';
import { YieldData, FinancialRecord, Field, InventoryItem, Insight } from '@/lib/types';

interface AnalyticsDashboardClientProps {
    yieldHistory: YieldData[];
    financialRecords: FinancialRecord[];
    fields: Field[];
    inventory: InventoryItem[];
    insights: Insight[];
}

type TimeRange = 'Yearly' | 'Seasonal' | 'Monthly';

export default function AnalyticsDashboardClient({
    yieldHistory,
    financialRecords,
    fields,
    inventory,
    insights
}: AnalyticsDashboardClientProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('Yearly');

    // --- Yield Analytics Logic ---
    const yieldAnalytics = useMemo(() => {
        let data: number[] = [];
        let labels: string[] = [];

        if (timeRange === 'Yearly') {
            data = yieldHistory.map(h => h.yield);
            labels = yieldHistory.map(h => h.year.toString());
        } else if (timeRange === 'Seasonal') {
            // Mock Seasonal
            data = [180, 240, 210, 150];
            labels = ['Spring', 'Summer', 'Autumn', 'Winter'];
        } else {
            // Mock Monthly
            data = [18, 20, 22, 25, 28, 30, 32, 30, 28, 25, 22, 20];
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        }

        // Ensure data for chart
        if (data.length === 0) data = [0, 0, 0];

        const current = data[data.length - 1] || 0;
        const previous = data[data.length - 2] || 0;
        const change = previous ? ((current - previous) / previous) * 100 : 0;

        return { data, labels, current, change };
    }, [yieldHistory, timeRange]);


    // --- Financial Analytics Logic ---
    const financialAnalytics = useMemo(() => {
        // Simple aggregation for demo
        const income = financialRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
        const expenses = financialRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
        const net = income - expenses;

        // Mock Monthly Trend for Bar Chart (Income vs Expense)
        const chartData = [
            { month: 'Jan', income: 12000, expense: 8000 },
            { month: 'Feb', income: 15000, expense: 9000 },
            { month: 'Mar', income: 18000, expense: 11000 },
            { month: 'Apr', income: 14000, expense: 10000 },
            { month: 'May', income: 22000, expense: 12000 },
            { month: 'Jun', income: 25000, expense: 13000 },
        ];

        return { income, expenses, net, chartData };
    }, [financialRecords]);

    // --- Crop Distribution Logic ---
    const cropDistribution = useMemo(() => {
        const distribution: Record<string, number> = {};
        let totalAcres = 0;

        fields.forEach(f => {
            distribution[f.crop] = (distribution[f.crop] || 0) + f.acres;
            totalAcres += f.acres;
        });

        return Object.entries(distribution).map(([crop, acres]) => ({
            crop,
            acres,
            percentage: (acres / totalAcres) * 100
        })).sort((a, b) => b.acres - a.acres);
    }, [fields]);

    // --- Helper for Charts ---
    const generateLinePath = (data: number[], width: number, height: number) => {
        if (data.length < 2) return "";
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        return data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * (height * 0.8) - (height * 0.1);
            return `${x},${y}`;
        }).join(' L');
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white transition-colors duration-300">
            {/* Header */}
            <header className="px-6 pb-6 pt-8 flex justify-between items-center shrink-0 max-w-7xl mx-auto w-full">
                <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase font-bold tracking-widest">Performance</p>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Farm Analytics</h1>
                </div>
                <div className="flex bg-white dark:bg-[#1e293b] rounded-xl p-1 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none">
                    {['Yearly', 'Seasonal', 'Monthly'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range as TimeRange)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === range
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 pb-24 space-y-6 md:px-8 md:pb-8 no-scrollbar bg-gray-50 dark:bg-[#0f172a] transition-colors duration-300">
                <div className="max-w-7xl mx-auto space-y-6">

                    {/* Top Row: Yield & Finance */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Yield Chart Card */}
                        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none transition-colors duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Yield Trend</h2>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-3xl font-black text-gray-900 dark:text-white">{yieldAnalytics.current}</span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 font-bold">Quintal</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center ${yieldAnalytics.change >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {yieldAnalytics.change >= 0 ? '+' : ''}{yieldAnalytics.change.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-widest">Total Forecast</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{(yieldAnalytics.current * 1240 / 1000).toFixed(1)}k <span className="text-sm font-normal text-gray-500 dark:text-gray-500">bu</span></p>
                                </div>
                            </div>

                            <div className="h-64 w-full relative">
                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                                    <defs>
                                        <linearGradient id="yieldChartGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {/* Grid Lines */}
                                    <line x1="0" y1="10" x2="100" y2="10" className="stroke-gray-200 dark:stroke-slate-700" strokeWidth="0.1" strokeDasharray="2" />
                                    <line x1="0" y1="25" x2="100" y2="25" className="stroke-gray-200 dark:stroke-slate-700" strokeWidth="0.1" strokeDasharray="2" />
                                    <line x1="0" y1="40" x2="100" y2="40" className="stroke-gray-200 dark:stroke-slate-700" strokeWidth="0.1" strokeDasharray="2" />

                                    {/* Chart */}
                                    <path d={`M0,50 L${generateLinePath(yieldAnalytics.data, 100, 50)} L100,50 Z`} fill="url(#yieldChartGrad)" />
                                    <path d={`M${generateLinePath(yieldAnalytics.data, 100, 50)}`} fill="none" stroke="#10b981" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />

                                    {/* Points */}
                                    {yieldAnalytics.data.map((val, i) => {
                                        const min = Math.min(...yieldAnalytics.data);
                                        const max = Math.max(...yieldAnalytics.data);
                                        const range = max - min || 1;
                                        const x = (i / (yieldAnalytics.data.length - 1)) * 100;
                                        const y = 50 - ((val - min) / range) * 40 - 5;
                                        return (
                                            <circle key={i} cx={x} cy={y} r="1" className="fill-white dark:fill-[#1e293b]" stroke="#10b981" strokeWidth="0.5" />
                                        );
                                    })}
                                </svg>
                                {/* X Axis Labels */}
                                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-medium pt-2">
                                    {yieldAnalytics.labels.filter((_, i) => i % Math.ceil(yieldAnalytics.labels.length / 6) === 0).map((l, i) => (
                                        <span key={i}>{l}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col justify-between transition-colors duration-300">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Financials</h2>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Income</span>
                                            <span className="material-icons text-emerald-500 text-sm">arrow_upward</span>
                                        </div>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">₹{(financialAnalytics.income / 100000).toFixed(2)}L</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Expenses</span>
                                            <span className="material-icons text-red-500 text-sm">arrow_downward</span>
                                        </div>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">₹{(financialAnalytics.expenses / 100000).toFixed(2)}L</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Profit</span>
                                    <span className={`text-xl font-bold ${financialAnalytics.net >= 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {financialAnalytics.net >= 0 ? '+' : '-'}₹{Math.abs(financialAnalytics.net / 100000).toFixed(2)}L
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row: Crop Dist & Inventory */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Crop Distribution */}
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none transition-colors duration-300">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Crop Distribution</h2>
                            <div className="flex items-center gap-8">
                                {/* Donut Chart (CSS Conic Gradient) */}
                                <div className="relative w-32 h-32 rounded-full shrink-0"
                                    style={{
                                        background: `conic-gradient(
                              #10b981 0% ${cropDistribution[0]?.percentage || 0}%,
                              #3b82f6 ${cropDistribution[0]?.percentage || 0}% ${(cropDistribution[0]?.percentage || 0) + (cropDistribution[1]?.percentage || 0)}%,
                              #f59e0b ${(cropDistribution[0]?.percentage || 0) + (cropDistribution[1]?.percentage || 0)}% 100%
                           )`
                                    }}
                                >
                                    <div className="absolute inset-4 bg-white dark:bg-[#1e293b] rounded-full flex items-center justify-center transition-colors duration-300">
                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Acres</span>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex-1 space-y-3">
                                    {cropDistribution.map((crop, i) => (
                                        <div key={crop.crop} className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{crop.crop}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-sm font-bold text-gray-900 dark:text-white">{crop.acres} ac</span>
                                                <span className="text-[10px] text-gray-500 dark:text-gray-500">{crop.percentage.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Inventory Alerts */}
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none transition-colors duration-300">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Low Stock Alerts</h2>
                            <div className="space-y-4">
                                {inventory.filter(i => i.quantity <= i.minThreshold).length > 0 ? (
                                    inventory.filter(i => i.quantity <= i.minThreshold).map(item => (
                                        <div key={item.id} className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex justify-between items-center group cursor-pointer hover:bg-red-500/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                                                    <span className="material-icons text-lg">inventory_2</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h4>
                                                    <p className="text-[10px] text-red-500 dark:text-red-400 font-medium mt-0.5">Below Threshold ({item.minThreshold})</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-lg font-black text-gray-900 dark:text-white">{item.quantity}</span>
                                                <span className="text-[10px] text-gray-500">{item.unit}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                                            <span className="material-icons text-emerald-500">check</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">All inventory levels are healthy.</p>
                                    </div>
                                )}
                                {/* View All Details Button */}
                                <button className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all mt-2 cursor-pointer">
                                    View Full Inventory
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
