'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Task } from '@/lib/types';
import { useSession } from 'next-auth/react';

interface TasksPageClientProps {
    initialTasks: Task[];
    userName: string;
    userAvatar: string;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getWeekDays(centerDate: Date): Date[] {
    const days: Date[] = [];
    const start = new Date(centerDate);
    start.setDate(start.getDate() - 3);
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    return days;
}

const TYPE_ICONS: Record<string, string> = {
    Machinery: 'agriculture',
    Water: 'water_drop',
    Chemical: 'science',
    Maintenance: 'build',
};

const PRIORITY_STYLES: Record<string, string> = {
    High: 'bg-red-50 text-red-500 dark:bg-red-900/20',
    Medium: 'bg-amber-50 text-amber-500 dark:bg-amber-900/20',
    Low: 'bg-gray-100 text-gray-400 dark:bg-gray-800',
};

export default function TasksPageClient({ initialTasks, userName, userAvatar }: TasksPageClientProps) {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showAddModal, setShowAddModal] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0);

    // New task form state
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        startTime: '09:00',
        endTime: '11:00',
        type: 'Maintenance' as Task['type'],
        priority: 'Medium' as 'High' | 'Medium' | 'Low',
    });

    const centerDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + weekOffset * 7);
        return d;
    }, [weekOffset]);

    const weekDays = useMemo(() => getWeekDays(centerDate), [centerDate]);
    const selectedDateKey = formatDateKey(selectedDate);

    const tasksForDate = useMemo(() => {
        return tasks
            .filter(t => t.date === selectedDateKey)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [tasks, selectedDateKey]);

    // Count tasks per day for dot indicators
    const taskCountByDate = useMemo(() => {
        const map: Record<string, number> = {};
        tasks.forEach(t => { map[t.date] = (map[t.date] || 0) + 1; });
        return map;
    }, [tasks]);

    const todayKey = formatDateKey(new Date());

    const toggleTaskStatus = (taskId: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id !== taskId) return t;
            const nextStatus: Record<string, Task['status']> = {
                'Pending': 'In Progress',
                'In Progress': 'Completed',
                'Completed': 'Pending',
            };
            return { ...t, status: nextStatus[t.status] };
        }));
    };

    const handleAddTask = () => {
        if (!newTask.title.trim()) return;
        const hours = parseInt(newTask.endTime.split(':')[0]) - parseInt(newTask.startTime.split(':')[0]);
        const task: Task = {
            id: `t${Date.now()}`,
            title: newTask.title,
            description: newTask.description,
            date: selectedDateKey,
            startTime: newTask.startTime,
            endTime: newTask.endTime,
            duration: `${Math.max(1, hours)} hrs`,
            status: 'Pending',
            type: newTask.type,
            priority: newTask.priority,
            userId: session?.user?.email || 'anonymous',
        };
        setTasks(prev => [...prev, task]);
        setNewTask({ title: '', description: '', startTime: '09:00', endTime: '11:00', type: 'Maintenance', priority: 'Medium' });
        setShowAddModal(false);
    };

    const handleAutoSchedule = async () => {
        if (!session?.user) return;
        try {
            const res = await fetch('/api/tasks/auto-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.user.email }),
            });
            const data = await res.json();
            alert(data.message);
            // Refresh tasks or just let user know
            window.location.reload(); 
        } catch (error) {
            console.error("Error auto-scheduling:", error);
        }
    };

    const completedCount = tasksForDate.filter(t => t.status === 'Completed').length;
    const totalCount = tasksForDate.length;

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="px-6 pt-4 pb-4 bg-white dark:bg-gray-900 sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800 shrink-0 md:static md:bg-transparent md:border-none md:pt-8">
                <div className="flex justify-between items-center mb-4 max-w-4xl mx-auto w-full">
                    <div>
                        <h2 className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">My Farm</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setWeekOffset(w => w - 1)} className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                                <span className="material-icons text-lg">chevron_left</span>
                            </button>
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {MONTH_NAMES[centerDate.getMonth()]} {centerDate.getFullYear()}
                            </h1>
                            <button onClick={() => setWeekOffset(w => w + 1)} className="text-gray-300 hover:text-gray-500 transition-colors cursor-pointer">
                                <span className="material-icons text-lg">chevron_right</span>
                            </button>
                            {weekOffset !== 0 && (
                                <button onClick={() => { setWeekOffset(0); setSelectedDate(new Date()); }} className="text-[10px] text-primary font-medium ml-1 cursor-pointer hover:underline">
                                    Today
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAutoSchedule}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-medium hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
                            title="Auto-schedule based on weather"
                        >
                            <span className="material-icons text-sm">auto_awesome</span>
                            Smart Sync
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors cursor-pointer flex items-center gap-1"
                        >
                            <span className="material-icons text-sm">add</span>
                            Add Task
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            <Image 
                                alt={userName} 
                                className="object-cover" 
                                src={userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`} 
                                width={32} 
                                height={32} 
                                unoptimized
                            />
                        </div>
                    </div>
                </div>

                {/* Calendar Strip */}
                <div className="flex justify-between items-center max-w-4xl mx-auto w-full md:bg-white md:dark:bg-gray-900 md:p-3 md:rounded-xl md:border md:border-gray-100 md:dark:border-gray-800">
                    {weekDays.map((day) => {
                        const dayKey = formatDateKey(day);
                        const isSelected = dayKey === selectedDateKey;
                        const isToday = dayKey === todayKey;
                        const hasTask = (taskCountByDate[dayKey] || 0) > 0;
                        return (
                            <button
                                key={dayKey}
                                onClick={() => setSelectedDate(new Date(day))}
                                className="flex flex-col items-center gap-1 cursor-pointer relative flex-1 py-1"
                            >
                                <span className={`text-[10px] font-medium ${isSelected ? 'text-primary' : isToday ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                    {DAY_NAMES[day.getDay()]}
                                </span>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors ${isSelected
                                        ? 'bg-primary text-white font-semibold'
                                        : isToday
                                            ? 'ring-1 ring-primary text-primary font-medium'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}>
                                    {day.getDate()}
                                </div>
                                {/* Task dot indicators */}
                                <div className="flex gap-0.5 h-1.5">
                                    {hasTask && !isSelected && (
                                        <span className="w-1 h-1 rounded-full bg-primary/50"></span>
                                    )}
                                    {isSelected && <span className="w-1 h-1 rounded-full bg-primary"></span>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-6 py-5 relative pb-24 md:pb-6">
                <div className="max-w-4xl mx-auto w-full space-y-4">
                    {/* Day Summary */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                {selectedDateKey === todayKey ? 'Today' : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </h3>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                                {totalCount === 0 ? 'No tasks scheduled' : `${completedCount}/${totalCount} completed`}
                            </p>
                        </div>
                        {totalCount > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="w-24 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">{totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</span>
                            </div>
                        )}
                    </div>

                    {/* Daily Insight (only for today) */}
                    {selectedDateKey === todayKey && totalCount > 0 && (
                        <div className="p-4 bg-gray-900 dark:bg-gray-800 rounded-xl text-white overflow-hidden relative">
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1">Daily Insight</p>
                                    <h3 className="text-sm font-semibold mb-1">
                                        {completedCount === totalCount ? '🎉 All Done!' : completedCount > 0 ? 'Keep Going!' : 'Optimal Conditions'}
                                    </h3>
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        {completedCount === totalCount
                                            ? `All ${totalCount} tasks completed for today. Great work!`
                                            : `${totalCount - completedCount} tasks remaining. Humidity at 65% — perfect for field work.`
                                        }
                                    </p>
                                </div>
                                <span className="material-icons text-primary text-2xl">
                                    {completedCount === totalCount ? 'verified' : 'wb_sunny'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {totalCount === 0 && (
                        <div className="text-center py-16">
                            <span className="material-icons text-5xl text-gray-200 dark:text-gray-700 mb-3">event_available</span>
                            <p className="text-sm font-medium text-gray-500 mb-1">No tasks for this day</p>
                            <p className="text-xs text-gray-400 mb-4">Tap &quot;Add Task&quot; to schedule something</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer"
                            >
                                + Schedule a Task
                            </button>
                        </div>
                    )}

                    {/* Task List */}
                    {tasksForDate.map((task) => (
                        <div key={task.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                            <div className="flex gap-3">
                                {/* Status Toggle */}
                                <button
                                    onClick={() => toggleTaskStatus(task.id)}
                                    className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${task.status === 'Completed'
                                            ? 'bg-primary border-primary'
                                            : task.status === 'In Progress'
                                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                                        }`}
                                    title="Toggle status: Pending → In Progress → Completed"
                                >
                                    {task.status === 'Completed' && (
                                        <span className="material-icons text-white text-[12px]">check</span>
                                    )}
                                    {task.status === 'In Progress' && (
                                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    )}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-medium text-gray-900 dark:text-white ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}>
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                            {task.priority && (
                                                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${PRIORITY_STYLES[task.priority]}`}>
                                                    {task.priority}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className={`text-xs text-gray-400 mb-2 ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}>
                                        {task.description}
                                    </p>

                                    {task.workerAvatars && (
                                        <div className="flex -space-x-1.5 overflow-hidden mb-2">
                                            {task.workerAvatars.map((avatar, idx) => (
                                                <Image key={idx} alt="Worker" className="inline-block rounded-full ring-2 ring-white dark:ring-gray-900 object-cover" src={avatar} width={22} height={22} unoptimized />
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 text-[10px] text-gray-400 pt-2 border-t border-gray-50 dark:border-gray-800">
                                        <span className="flex items-center gap-0.5 font-medium">
                                            <span className="material-icons text-[12px]">schedule</span>
                                            {task.startTime}{task.endTime ? ` – ${task.endTime}` : ''}
                                        </span>
                                        <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                                        <span className="flex items-center gap-0.5">
                                            <span className="material-icons text-[12px]">{TYPE_ICONS[task.type]}</span>
                                            {task.type}
                                        </span>
                                        {task.location && (
                                            <>
                                                <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                                                <span className="flex items-center gap-0.5">
                                                    <span className="material-icons text-[12px]">location_on</span>
                                                    {task.location}
                                                </span>
                                            </>
                                        )}
                                        <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                                        <span>{task.duration}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Add Task Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-xl rounded-t-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">New Task</h2>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                                <span className="material-icons text-lg">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5">Task Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Irrigate Field B"
                                    value={newTask.title}
                                    onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-300 focus:border-primary outline-none transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5">Description</label>
                                <textarea
                                    placeholder="Add details about the task..."
                                    value={newTask.description}
                                    onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                                    rows={2}
                                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-300 focus:border-primary outline-none transition-colors resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Start Time</label>
                                    <input
                                        type="time"
                                        value={newTask.startTime}
                                        onChange={e => setNewTask(p => ({ ...p, startTime: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">End Time</label>
                                    <input
                                        type="time"
                                        value={newTask.endTime}
                                        onChange={e => setNewTask(p => ({ ...p, endTime: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Type</label>
                                    <select
                                        value={newTask.type}
                                        onChange={e => setNewTask(p => ({ ...p, type: e.target.value as Task['type'] }))}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
                                    >
                                        <option value="Machinery">Machinery</option>
                                        <option value="Water">Water / Irrigation</option>
                                        <option value="Chemical">Chemical / Fertilizer</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1.5">Priority</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={e => setNewTask(p => ({ ...p, priority: e.target.value as 'High' | 'Medium' | 'Low' }))}
                                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddTask}
                                disabled={!newTask.title.trim()}
                                className="flex-1 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
