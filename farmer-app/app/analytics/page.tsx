import React from 'react';
import { getInsights, getYieldHistory } from '@/lib/data';

export default async function AnalyticsPage() {
    const history = await getYieldHistory();
    const insights = await getInsights();
    const currentYear = history[history.length - 1];

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="px-6 pt-6 pb-4 flex justify-between items-center sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm shrink-0 md:pt-8">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Analytics</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Golden Harvest Farms</p>
                </div>
                <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                    <span className="material-icons text-[20px]">account_circle</span>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-5 py-4 space-y-5 overflow-y-auto pb-24 md:px-8 md:pb-8 no-scrollbar">
                {/* Time Range Filter */}
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex max-w-xs">
                    <button className="flex-1 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm transition-all cursor-pointer">Yearly</button>
                    <button className="flex-1 py-1.5 text-xs font-medium rounded-md text-gray-400 hover:text-gray-600 transition-all cursor-pointer">Seasonal</button>
                    <button className="flex-1 py-1.5 text-xs font-medium rounded-md text-gray-400 hover:text-gray-600 transition-all cursor-pointer">Monthly</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Yield Graph Card */}
                    <div className="lg:col-span-8 bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-start mb-5">
                            <div>
                                <h2 className="text-sm font-medium text-gray-900 dark:text-white">Corn Yield</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">{currentYear.yield}</span>
                                    <span className="text-xs text-gray-400">bu/ac</span>
                                    <span className="bg-primary/10 text-primary text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center">
                                        <span className="material-icons text-[10px] mr-0.5">trending_up</span>
                                        +5.2%
                                    </span>
                                </div>
                            </div>
                            <button className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                                <span className="material-icons text-lg">more_horiz</span>
                            </button>
                        </div>
                        {/* Chart */}
                        <div className="relative h-52 w-full">
                            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-300 w-6 text-right pr-1">
                                <span>200</span><span>150</span><span>100</span><span>50</span>
                            </div>
                            <div className="absolute left-8 right-0 top-2 bottom-6">
                                <div className="w-full h-full flex flex-col justify-between">
                                    <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                                    <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                                    <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                                    <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                                </div>
                                <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="gradientPrimaryAnalytics" x1="0%" x2="0%" y1="0%" y2="100%">
                                            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.15 }} />
                                            <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
                                        </linearGradient>
                                    </defs>
                                    <polyline className="opacity-40" fill="none" points="0,90 40,85 80,70 120,75 160,60 200,65 240,50 280,55 320,60 360,50 400,55" stroke="#d1d5db" strokeDasharray="4,4" strokeWidth="1.5" vectorEffect="non-scaling-stroke"></polyline>
                                    <path className="opacity-50" d="M0,80 L40,70 L80,50 L120,45 L160,30 L200,25 L240,15 L280,20 V200 H0 Z" fill="url(#gradientPrimaryAnalytics)"></path>
                                    <polyline fill="none" points="0,80 40,70 80,50 120,45 160,30 200,25 240,15 280,20" stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" vectorEffect="non-scaling-stroke"></polyline>
                                    <circle cx="280" cy="20" fill="#ffffff" r="4" stroke="#10b981" strokeWidth="2"></circle>
                                </svg>
                            </div>
                            <div className="absolute left-8 right-0 bottom-0 flex justify-between text-[10px] text-gray-300 pt-2">
                                {history.map(h => <span key={h.year}>{h.year}</span>)}
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-5 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <span className="text-[10px] text-gray-400">Current</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-px bg-gray-300 border-t border-dashed border-gray-300"></div>
                                <span className="text-[10px] text-gray-400">Last Year</span>
                            </div>
                        </div>
                    </div>

                    {/* KPI Column */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                    <span className="material-icons text-sm">landscape</span>
                                    <span className="text-[10px] font-medium uppercase tracking-wide">Acres</span>
                                </div>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">1,240</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                                    <span className="material-icons text-sm">local_shipping</span>
                                    <span className="text-[10px] font-medium uppercase tracking-wide">Total Est.</span>
                                </div>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{Math.round(currentYear.total / 1000)}k <span className="text-sm font-normal text-gray-400">bu</span></p>
                            </div>
                        </div>
                        {/* Insight Card */}
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex-1">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                                    <span className="material-icons text-base">science</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{insights[0].title}</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">{insights[0].description}</p>
                                    {insights[0].actionLabel && (
                                        <button className="mt-2 text-xs font-medium text-primary flex items-center gap-0.5 hover:underline">
                                            {insights[0].actionLabel} <span className="material-icons text-[12px]">arrow_forward</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* More Insights */}
                <div className="space-y-3 pb-4">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">More Insights</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {insights.slice(1).map((insight) => (
                            <div key={insight.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                <div className="flex items-start gap-3">
                                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${insight.type === 'warning' ? 'bg-amber-50 text-amber-500 dark:bg-amber-900/20' :
                                            insight.type === 'positive' ? 'bg-primary/10 text-primary' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'
                                        }`}>
                                        <span className="material-icons text-base">
                                            {insight.type === 'warning' ? 'warning_amber' : insight.type === 'positive' ? 'check_circle' : 'info'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{insight.title}</h4>
                                        <p className="text-xs text-gray-400 leading-relaxed">{insight.description}</p>
                                        {insight.actionLabel && (
                                            <button className="mt-2 text-xs font-medium text-primary hover:underline">
                                                {insight.actionLabel}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
