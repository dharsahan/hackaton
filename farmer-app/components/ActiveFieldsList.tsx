import React from 'react';
import Link from 'next/link';
import { getFields } from '@/lib/data';
import DashboardFieldCard from './DashboardFieldCard';

export default async function ActiveFieldsList({ userId }: { userId: string }) {
  const fields = await getFields(userId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Fields</h2>
        </div>
        <Link className="text-xs font-bold text-primary hover:underline transition-all" href="/fields">See All Fields</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.length > 0 ? fields.slice(0, 4).map((field: any) => (
          <DashboardFieldCard key={field.id} field={JSON.parse(JSON.stringify(field))} />
        )) : (
          <div className="col-span-full bg-white dark:bg-gray-900 p-12 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
              <span className="material-icons text-3xl">grass</span>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white">No active fields found</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto leading-relaxed">Start by creating your first field on the interactive map to track growth and harvest.</p>
            </div>
            <Link href="/fields" className="inline-block bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">Go to Map</Link>
          </div>
        )}
      </div>
    </div>
  );
}
