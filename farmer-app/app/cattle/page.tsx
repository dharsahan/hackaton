import React from 'react';
import { getCattle } from '@/lib/data';
import CattlePageClient from '@/components/CattlePageClient';

export default async function CattlePage() {
  const cattle = await getCattle();
  return <CattlePageClient cattle={cattle} />;
}
