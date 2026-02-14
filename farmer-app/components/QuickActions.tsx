import React from 'react';
import Link from 'next/link';

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/harvest-log" className="bg-primary/10 hover:bg-primary/15 transition-colors p-4 rounded-xl flex flex-col items-center justify-center text-center group">
          <span className="material-icons text-primary text-2xl mb-2">agriculture</span>
          <span className="font-medium text-sm text-gray-700 dark:text-gray-200">Log Harvest</span>
        </Link>
        <Link href="/tasks" className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center group">
          <span className="material-icons text-primary text-2xl mb-2">add_task</span>
          <span className="font-medium text-sm text-gray-700 dark:text-gray-200">New Task</span>
        </Link>
      </div>
    </div>
  );
}
