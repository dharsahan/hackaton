import React from 'react';
import { getFinanceRecords } from '@/lib/data';
import FinancePageClient from './FinancePageClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email || "farmer";
  const records = await getFinanceRecords(userId);

  return <FinancePageClient initialRecords={records} />;
}
