import React from 'react';
import { getTasks, getUser } from '@/lib/data';
import TasksPageClient from '@/components/TasksPageClient';

export default async function TasksPage() {
    const tasks = await getTasks();
    const user = await getUser();

    return (
        <TasksPageClient
            initialTasks={tasks}
            userName={user.name}
            userAvatar={user.avatarUrl}
        />
    );
}
