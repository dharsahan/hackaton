import React from 'react';
import {
    getInsights,
    getYieldHistory,
    getFinanceRecords,
    getFields,
    getInventory
} from '@/lib/data';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import AnalyticsDashboardClient from '@/components/AnalyticsDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email || "farmer";

    // Fetch all required data in parallel
    const [yieldHistory, financialRecords, fields, inventory, insights] = await Promise.all([
        getYieldHistory(userId),
        getFinanceRecords(userId),
        getFields(userId),
        getInventory(userId),
        getInsights(userId)
    ]);

    return (
        <AnalyticsDashboardClient
            yieldHistory={yieldHistory}
            financialRecords={financialRecords}
            fields={fields}
            inventory={inventory}
            insights={insights}
        />
    );
}
