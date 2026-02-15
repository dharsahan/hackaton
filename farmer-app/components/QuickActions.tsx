import React from 'react';
import Link from 'next/link';

export default function QuickActions() {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/harvest-log" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-all p-5 rounded-3xl flex flex-col items-center justify-center text-center group shadow-sm hover:shadow-md active:scale-95">
          <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-all">
            <span className="material-icons text-2xl">agriculture</span>
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white">Log Harvest</span>
          <span className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-tighter">Record Yield</span>
        </Link>
        
        <Link href="/tasks" className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-emerald-400/30 transition-all p-5 rounded-3xl flex flex-col items-center justify-center text-center group shadow-sm hover:shadow-md active:scale-95">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-all">
            <span className="material-icons text-2xl">add_task</span>
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white">New Task</span>
          <span className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-tighter">Schedule Work</span>
        </Link>
      </div>
    </div>
  );
}
