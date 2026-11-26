'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/task';
import { api, ApiClientError } from '@/lib/api';
import { TaskTable } from '@/components/task-table';
import { CheckCircle2, Clock, ListTodo, Layers } from 'lucide-react';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Unable to reach the backend server. Make sure the API is running on http://localhost:3001.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskCreatedOrUpdated = (updatedTask: Task) => {
    setTasks((prev) => {
      const index = prev.findIndex((t) => t.id === updatedTask.id);
      if (index >= 0) {
        const next = [...prev];
        next[index] = updatedTask;
        return next;
      }
      return [updatedTask, ...prev];
    });
  };

  const handleTaskDeleted = (deletedId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== deletedId));
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Navigation Bar */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
              TM
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-base tracking-tight leading-none">
                Task Manager
              </h1>
            </div>
          </div>
          <div className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Metric Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Tasks</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">To Do</p>
              <p className="text-xl font-bold text-foreground">{stats.todo}</p>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">In Progress</p>
              <p className="text-xl font-bold text-foreground">{stats.inProgress}</p>
            </div>
          </div>

          <div className="bg-card p-4 rounded-lg border shadow-xs flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Done</p>
              <p className="text-xl font-bold text-foreground">{stats.done}</p>
            </div>
          </div>
        </div>

        {/* Task Management Table with shadcn/ui */}
        <TaskTable
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          onRefresh={fetchTasks}
          onTaskCreatedOrUpdated={handleTaskCreatedOrUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      </div>
    </main>
  );
}
