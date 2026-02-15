import React from 'react';
import { getYieldHistory } from '@/lib/data';

export default async function YieldSummaryCard({ userId }: { userId: string }) {
  const history = await getYieldHistory(userId);
  
  if (!history || history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center min-h-[140px]">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Est. Yield</p>
        <p className="text-sm font-bold text-gray-300 mt-2">No data yet</p>
      </div>
    );
  }

  const currentYear = history[history.length - 1];
  const lastYear = history[history.length - 2];

  const totalYield = currentYear?.yield * 1240;
  const yieldChange = lastYear ? ((currentYear.yield - lastYear.yield) / lastYear.yield) * 100 : 0;
  const isPositive = yieldChange >= 0;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between group hover:border-primary/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <span className="material-icons">analytics</span>
        </div>
        <div className="flex flex-col items-end">
          <div className={`flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${isPositive ? 'text-primary bg-primary/10' : 'text-red-500 bg-red-50 dark:bg-red-900/20'
            }`}>
            <span className="material-icons text-[12px] mr-0.5">{isPositive ? 'expand_less' : 'expand_more'}</span>
            {isPositive ? '+' : ''}{yieldChange.toFixed(1)}%
          </div>
          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter mt-1">vs Last Year</span>
        </div>
      </div>
      
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Est. Yield</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{Math.round(totalYield / 1000)}k</span>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Bushels</span>
        </div>
      </div>
    </div>
  );
}
