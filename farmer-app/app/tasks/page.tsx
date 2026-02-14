import React from 'react';
import { getTasks, getUser } from '@/lib/data';
import TasksPageClient from '@/components/TasksPageClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function TasksPage() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email || "farmer";
    
    const tasks = await getTasks(userId);
    const user = await getUser(userId);

    return (
        <TasksPageClient
            initialTasks={tasks}
            userName={user?.name || "Farmer"}
            userAvatar={user?.avatarUrl || ""}
        />
    );
}
