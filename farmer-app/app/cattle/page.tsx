import React from 'react';
import { getCattle } from '@/lib/data';
import CattlePageClient from '@/components/CattlePageClient';

export const dynamic = 'force-dynamic';

export default async function CattlePage() {
  const cattle = await getCattle();
  return <CattlePageClient cattle={cattle} />;
}
