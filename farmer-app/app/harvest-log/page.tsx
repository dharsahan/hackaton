import React from 'react';
import { getFields, getHarvestRecords } from '@/lib/data';
import HarvestLogClient from '@/components/HarvestLogClient';

export default async function HarvestLogPage() {
  const fields = await getFields();
  const records = await getHarvestRecords();

  return <HarvestLogClient fields={fields} initialRecords={records} />;
}
