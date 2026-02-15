import React from 'react';
import { getTasks } from '@/lib/data';
import Link from 'next/link';

export default async function UpcomingTasks({ userId }: { userId: string }) {
    const tasks = await getTasks(userId);
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 4);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end px-1">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upcoming Tasks</h2>
                <Link href="/tasks" className="text-xs font-bold text-primary hover:underline transition-all">See All</Link>
            </div>

            <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm divide-y divide-gray-50 dark:divide-gray-800/50">
                {pendingTasks.length > 0 ? pendingTasks.map((task) => (
                    <div key={task.id} className="p-4 flex items-center gap-4 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer first:rounded-t-3xl last:rounded-b-3xl">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all ${task.type === 'Water' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' :
                                task.type === 'Chemical' ? 'bg-purple-50 text-purple-500 dark:bg-purple-900/20' :
                                    task.type === 'Machinery' ? 'bg-orange-50 text-orange-500 dark:bg-orange-900/20' :
                                        'bg-gray-50 dark:bg-gray-800/50'
                            }`}>
                            <span className="material-icons text-lg">
                                {task.type === 'Water' ? 'water_drop' :
                                    task.type === 'Chemical' ? 'science' :
                                        task.type === 'Machinery' ? 'agriculture' : 'event_note'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-0.5">{task.title}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-medium">{task.startTime}</span>
                                {task.priority === 'High' && (
                                    <span className="text-[8px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full uppercase">High</span>
                                )}
                            </div>
                        </div>
                        <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all text-gray-300">
                            <span className="material-icons text-sm">check</span>
                        </button>
                    </div>
                )) : (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center mx-auto mb-3">
                            <span className="material-icons">check_circle</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">All Clear!</p>
                        <p className="text-xs text-gray-400 mt-1">No pending tasks for today.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
