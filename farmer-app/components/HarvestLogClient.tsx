'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Field, HarvestRecord } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';

interface HarvestLogClientProps {
    fields: Field[];
    initialRecords: HarvestRecord[];
}

const GRADE_STYLES: Record<string, string> = {
    A: 'bg-primary/10 text-primary',
    B: 'bg-amber-50 text-amber-500 dark:bg-amber-900/20',
    C: 'bg-red-50 text-red-500 dark:bg-red-900/20',
};

type ViewMode = 'form' | 'history';

export default function HarvestLogClient({ fields, initialRecords }: HarvestLogClientProps) {
    const { data: session } = useSession();
    const [records, setRecords] = useState<HarvestRecord[]>(initialRecords);
    const [view, setView] = useState<ViewMode>('form');
    const [saved, setSaved] = useState(false);

    // Form state
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const [selectedFieldId, setSelectedFieldId] = useState(fields[0]?.id || '');
    const [date, setDate] = useState(todayStr);
    const [time, setTime] = useState(nowTimeStr);
    const [weight, setWeight] = useState('');
    const [moisture, setMoisture] = useState('');
    const [grade, setGrade] = useState<'A' | 'B' | 'C'>('A');
    const [notes, setNotes] = useState('');

    const selectedField = fields.find(f => f.id === selectedFieldId);

    const canSave = weight !== '' && parseFloat(weight) > 0 && selectedFieldId !== '';

    // Stats from all records
    const stats = useMemo(() => {
        const totalWeight = records.reduce((sum, r) => sum + r.weightTons, 0);
        const avgMoisture = records.length > 0 ? records.reduce((sum, r) => sum + r.moisturePercent, 0) / records.length : 0;
        const gradeACt = records.filter(r => r.qualityGrade === 'A').length;
        return { totalWeight, avgMoisture, gradeACt, total: records.length };
    }, [records]);

    const handleSave = async () => {
        if (!canSave || !selectedField || !session?.user) {
            if (!session?.user) alert("Please sign in to log harvest.");
            return;
        }
        const recordData = {
            fieldId: selectedFieldId,
            fieldName: selectedField.name,
            crop: selectedField.crop,
            date,
            time,
            weightTons: parseFloat(weight),
            moisturePercent: moisture ? parseFloat(moisture) : 0,
            qualityGrade: grade,
            notes: notes || null,
            userId: session.user.email || 'anonymous',
        };

        try {
            const docRef = await addDoc(collection(db, 'harvest_records'), recordData);
            const newRecord: HarvestRecord = {
                id: docRef.id,
                ...recordData,
                notes: recordData.notes || undefined,
            };
            setRecords(prev => [newRecord, ...prev]);
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                setWeight('');
                setMoisture('');
                setGrade('A');
                setNotes('');
                setDate(todayStr);
                setTime(nowTimeStr);
            }, 2000);
        } catch (error) {
            console.error("Error saving harvest record:", error);
            alert("Failed to save harvest record. Please try again.");
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="flex-none px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 shrink-0">
                <Link href="/" className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <span className="material-icons text-xl">arrow_back</span>
                </Link>
                <h1 className="text-sm font-medium text-gray-900 dark:text-white">Harvest Log</h1>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                    <button
                        onClick={() => setView('form')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${view === 'form' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400'
                            }`}
                    >
                        New
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${view === 'history' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400'
                            }`}
                    >
                        History
                    </button>
                </div>
            </header>

            {/* Form View */}
            {view === 'form' && (
                <>
                    <main className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-5 pb-32 bg-background-light dark:bg-background-dark">
                        {/* Success Toast */}
                        {saved && (
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 animate-in">
                                <span className="material-icons text-primary text-xl">check_circle</span>
                                <div>
                                    <p className="text-sm font-medium text-primary">Harvest Record Saved!</p>
                                    <p className="text-[10px] text-primary/70">
                                        {weight} tons of {selectedField?.crop} from {selectedField?.name}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 ml-0.5">Date</label>
                                <div className="relative">
                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">calendar_today</span>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 ml-0.5">Time</label>
                                <div className="relative">
                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">schedule</span>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={e => setTime(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:border-primary outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Field Selector */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5 ml-0.5">Field Location</label>
                            <div className="space-y-2">
                                {fields.map(field => (
                                    <button
                                        key={field.id}
                                        onClick={() => setSelectedFieldId(field.id)}
                                        className={`w-full rounded-xl px-4 py-3 flex items-center justify-between transition-all text-left cursor-pointer ${selectedFieldId === field.id
                                                ? 'bg-primary/5 border-2 border-primary'
                                                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${selectedFieldId === field.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                                }`}>
                                                <span className="material-icons text-lg">terrain</span>
                                            </div>
                                            <div>
                                                <span className="block text-sm font-medium text-gray-900 dark:text-white">{field.name}</span>
                                                <span className="block text-[10px] text-gray-400">{field.crop} · {field.acres} acres</span>
                                            </div>
                                        </div>
                                        {selectedFieldId === field.id && (
                                            <span className="material-icons text-primary text-lg">check_circle</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800"></div>

                        {/* Weight Input */}
                        <div>
                            <label className="block text-xs text-primary mb-1.5 ml-0.5 font-medium">
                                Total Weight (Tons) *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="0.0"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    className="w-full bg-white dark:bg-gray-900 border border-primary rounded-lg px-4 py-3.5 text-2xl font-semibold text-gray-900 dark:text-white outline-none ring-1 ring-primary/20 focus:ring-primary/40 transition-all placeholder:text-gray-200"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 uppercase font-medium">Tons</span>
                            </div>
                        </div>

                        {/* Moisture & Grade */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 ml-0.5">Moisture %</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        placeholder="0.0"
                                        value={moisture}
                                        onChange={e => setMoisture(e.target.value)}
                                        className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-lg font-semibold text-gray-900 dark:text-white focus:border-primary outline-none transition-colors placeholder:text-gray-200"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1.5 ml-0.5">Quality Grade</label>
                                <div className="flex gap-2">
                                    {(['A', 'B', 'C'] as const).map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setGrade(g)}
                                            className={`flex-1 py-3 rounded-lg text-lg font-semibold cursor-pointer transition-all ${grade === g
                                                    ? `${GRADE_STYLES[g]} ring-2 ring-current/20`
                                                    : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5 ml-0.5">Notes (optional)</label>
                            <textarea
                                placeholder="Add any observations about this harvest..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                rows={2}
                                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-colors resize-none placeholder:text-gray-300"
                            />
                        </div>
                    </main>

                    {/* Save Button */}
                    <div className="flex-none bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-20 shrink-0 px-6 py-4">
                        <button
                            onClick={handleSave}
                            disabled={!canSave || saved}
                            className={`w-full font-medium py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ${canSave && !saved
                                    ? 'bg-primary hover:bg-primary-dark text-white'
                                    : saved
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <span className="material-icons text-lg">{saved ? 'check' : 'save_alt'}</span>
                            <span>{saved ? 'Saved!' : 'Save Harvest Record'}</span>
                        </button>
                    </div>
                </>
            )}

            {/* History View */}
            {view === 'history' && (
                <main className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24 space-y-5">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Total</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.totalWeight.toFixed(1)}</p>
                            <p className="text-[10px] text-gray-400">tons</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Avg Moisture</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.avgMoisture.toFixed(1)}%</p>
                            <p className="text-[10px] text-gray-400">{stats.total} records</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Grade A</p>
                            <p className="text-lg font-semibold text-primary">{stats.gradeACt}</p>
                            <p className="text-[10px] text-gray-400">of {stats.total}</p>
                        </div>
                    </div>

                    {/* Records List */}
                    <div>
                        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Recent Records</h3>
                        <div className="space-y-3">
                            {records.map(record => (
                                <div key={record.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                                                <span className="material-icons text-lg">grass</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{record.crop}</h4>
                                                <p className="text-[10px] text-gray-400">{record.fieldName}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${GRADE_STYLES[record.qualityGrade]}`}>
                                            {record.qualityGrade}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-[11px] text-gray-500 mb-2">
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons text-[12px]">scale</span>
                                            <strong className="text-gray-900 dark:text-white">{record.weightTons}</strong> tons
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons text-[12px]">water_drop</span>
                                            {record.moisturePercent}%
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-icons text-[12px]">calendar_today</span>
                                            {formatDate(record.date)}
                                        </span>
                                        <span>{record.time}</span>
                                    </div>

                                    {record.notes && (
                                        <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-50 dark:border-gray-800 leading-relaxed">
                                            {record.notes}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
}
