import React from 'react';
import { getFields, getHarvestRecords } from '@/lib/data';
import HarvestLogClient from '@/components/HarvestLogClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function HarvestLogPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email || "farmer";
  
  const fields = await getFields(userId);
  const records = await getHarvestRecords(userId);

  return <HarvestLogClient fields={fields} initialRecords={records} />;
}
