import React from 'react';
import Link from 'next/link';
import { getFields } from '@/lib/data';

export default async function ActiveFieldsList({ userId }: { userId: string }) {
  const fields = await getFields(userId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Fields</h2>
          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">Growth Progress</p>
        </div>
        <Link className="text-xs font-bold text-primary hover:underline transition-all" href="/fields">See All Fields</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.length > 0 ? fields.slice(0, 4).map((field) => (
          <div key={field.id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-primary/20 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                  (field.crop.includes('Tree') || field.crop.includes('Wood') || field.crop.includes('Sandalwood')) 
                    ? 'bg-amber-50 text-amber-600' 
                    : 'bg-green-50 text-green-600'
                }`}>
                  <span className="material-icons text-xl">agriculture</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight group-hover:text-primary transition-colors">{field.crop}</h3>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">{field.name} · {field.growthStage}</p>
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${field.status === 'Healthy'
                  ? 'bg-green-50 text-green-600'
                  : 'bg-amber-50 text-amber-600'
                }`}>{field.status}</span>
            </div>

            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Maturity</span>
                <span className="text-gray-900 dark:text-white">{field.maturityPercentage}%</span>
              </div>
              <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    field.maturityPercentage > 80 ? 'bg-primary' : 'bg-primary/60'
                  }`} 
                  style={{ width: `${field.maturityPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
               <div className="flex items-center gap-1 text-gray-400">
                  <span className="material-icons text-xs">straighten</span>
                  <span className="text-[10px] font-bold uppercase">{field.acres} Acres</span>
               </div>
               <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Details</button>
            </div>
          </div>
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
