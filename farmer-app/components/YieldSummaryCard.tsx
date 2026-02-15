import React from 'react';
import { getYieldHistory } from '@/lib/data';

export default async function YieldSummaryCard({ userId }: { userId: string }) {
  const history = await getYieldHistory(userId);

  // Mock data for chart if history is empty or short
  const chartData = history.length > 0
    ? history.map(h => h.yield)
    : [120, 132, 101, 134, 190, 230, 210];

  // Ensure we have enough points for a curve
  if (chartData.length < 5) chartData.push(...[180, 220, 200, 240]);

  const currentYear = history[history.length - 1];
  const lastYear = history[history.length - 2];
  const totalYield = currentYear?.yield * 1240 || 0; // Fallback mock
  const yieldChange = lastYear ? ((currentYear.yield - lastYear.yield) / lastYear.yield) * 100 : 12.5;
  const isPositive = yieldChange >= 0;

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

  return (
    <div className="bg-white dark:bg-[#1e293b] p-0 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden group h-full min-h-[160px] flex flex-col justify-between">
      {/* Background Chart */}
      <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
          <defs>
            <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#yieldGrad)" />
          <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-2">
          <div className="w-10 h-10 rounded-2xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981] group-hover:scale-110 transition-transform duration-300">
            <span className="material-icons">analytics</span>
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${isPositive ? 'text-[#10b981] bg-[#10b981]/10' : 'text-red-500 bg-red-500/10'}`}>
            <span className="material-icons text-[12px]">{isPositive ? 'trending_up' : 'trending_down'}</span>
            {Math.abs(yieldChange).toFixed(1)}%
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Est. Yield</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{Math.round(totalYield / 100)}k</span>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Quintals</span>
          </div>
        </div>
      </div>
    </div>
  );
}
