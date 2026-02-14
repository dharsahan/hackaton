'use client';

import React, { useState } from 'react';
import { FinancialRecord } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';

interface FinancePageClientProps {
    initialRecords: FinancialRecord[];
}

export default function FinancePageClient({ initialRecords }: FinancePageClientProps) {
    const { data: session } = useSession();
    const [records, setRecords] = useState(initialRecords);
    
    const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    const netROI = totalIncome - totalExpense;

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Ledger</h1>
                <p className="text-sm text-gray-400">Track ROI and farm profitability</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Income</p>
                    <p className="text-2xl font-bold text-primary">₹{totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-500">₹{totalExpense.toLocaleString()}</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Net ROI</p>
                    <p className={`text-2xl font-bold ${netROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ₹{netROI.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Description</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Category</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {records.map(record => (
                            <tr key={record.id}>
                                <td className="px-6 py-4 text-sm text-gray-500">{record.date}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{record.description}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{record.category}</td>
                                <td className={`px-6 py-4 text-sm font-bold text-right ${record.type === 'income' ? 'text-primary' : 'text-red-500'}`}>
                                    {record.type === 'income' ? '+' : '-'}₹{record.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
