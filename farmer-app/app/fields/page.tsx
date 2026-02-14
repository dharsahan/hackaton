import React from 'react';
import { getFields } from '@/lib/data';
import FieldsPageClient from './FieldsPageClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function FieldsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email || "farmer";
  const fields = await getFields(userId);

  return <FieldsPageClient fields={fields} />;
}
