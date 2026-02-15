import React from 'react';
import { getYieldHistory } from '@/lib/data';
import YieldSummaryCardClient from './YieldSummaryCardClient';

export default async function YieldSummaryCard({ userId }: { userId: string }) {
  const history = await getYieldHistory(userId);

  return (
    <YieldSummaryCardClient initialHistory={history} />
  );
}
