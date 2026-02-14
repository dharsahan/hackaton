import React from 'react';
import Link from 'next/link';
import { getFields } from '@/lib/data';

export default async function ActiveFieldsList({ userId }: { userId: string }) {
  const fields = await getFields(userId);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Active Fields</h2>
        <Link className="text-xs font-medium text-primary hover:text-primary-dark transition-colors" href="/fields">View All</Link>
      </div>
      <div className="space-y-2">
        {fields.length > 0 ? fields.slice(0, 3).map((field) => (
          <div key={field.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">{field.crop}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{field.name} · {field.growthStage}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${field.status === 'Healthy'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-ochre/10 text-ochre'
                }`}>{field.status}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${field.maturityPercentage}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
              <span>Maturity</span>
              <span>{field.maturityPercentage}%</span>
            </div>
          </div>
        )) : (
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-400">No active fields found. Create one in the Map section!</p>
          </div>
        )}
      </div>
    </div>
  );
}
