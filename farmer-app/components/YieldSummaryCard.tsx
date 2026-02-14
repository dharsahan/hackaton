import React from 'react';
import { getYieldHistory } from '@/lib/data';

export default async function YieldSummaryCard({ userId }: { userId: string }) {
  const history = await getYieldHistory(userId);
  
  if (!history || history.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wide">Total Est. Yield</h3>
        <p className="text-sm text-gray-400 mt-2">No yield data available</p>
      </div>
    );
  }

  const currentYear = history[history.length - 1];
  const lastYear = history[history.length - 2];

  const totalYield = currentYear?.yield * 1240;
  const yieldChange = lastYear ? ((currentYear.yield - lastYear.yield) / lastYear.yield) * 100 : 0;
  const isPositive = yieldChange >= 0;

  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wide">Total Est. Yield</h3>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">{Math.round(totalYield / 1000)}k</span>
            <span className="text-sm text-gray-400">Bushels</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-md ${isPositive ? 'text-primary bg-primary/10' : 'text-red-500 bg-red-50 dark:bg-red-900/20'
            }`}>
            <span className="material-icons text-[12px] mr-0.5">{isPositive ? 'trending_up' : 'trending_down'}</span>
            {isPositive ? '+' : ''}{yieldChange.toFixed(1)}%
          </span>
          <span className="text-[10px] text-gray-400">vs Last Year</span>
        </div>
      </div>
    </div>
  );
}
