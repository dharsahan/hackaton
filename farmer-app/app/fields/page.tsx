import React from 'react';
import { getFields } from '@/lib/data';
import FieldsPageClient from './FieldsPageClient';

export default async function FieldsPage() {
  const fields = await getFields();

  return <FieldsPageClient fields={fields} />;
}
