'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task, TaskStatus } from '@/types/task';
import { TaskFormDialog } from './task-form-dialog';
import { DeleteConfirmDialog } from './delete-confirm-dialog';
import { Pencil, Trash2, Plus, Search, Calendar, RefreshCw } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onTaskCreatedOrUpdated: (task: Task) => void;
  onTaskDeleted: (id: string) => void;
}

export function TaskTable({
  tasks,
  isLoading,
  error,
  onRefresh,
  onTaskCreatedOrUpdated,
  onTaskDeleted,
}: TaskTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ? true : task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, statusFilter]);

  const handleOpenCreate = () => {
    setTaskToEdit(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setTaskToEdit(task);
    setFormDialogOpen(true);
  };

  const handleOpenDelete = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'TODO':
        return <Badge variant="todo">To Do</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="in_progress">In Progress</Badge>;
      case 'DONE':
        return <Badge variant="done">Done</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return <span className="text-muted-foreground">—</span>;
    try {
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Calendar className="h-3 w-3" />
          {dateString}
        </span>
      );
    } catch {
      return dateString;
    }
  };

  const formatCreatedAt = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return (
        <span className="text-xs text-muted-foreground">
          {d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      );
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/30">
            {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-background shadow-xs text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {st === 'ALL'
                  ? 'All'
                  : st === 'TODO'
                  ? 'To Do'
                  : st === 'IN_PROGRESS'
                  ? 'In Progress'
                  : 'Done'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh tasks"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center justify-between">
          <span>Failed to load tasks: {error}</span>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Retry
          </Button>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[28%]">Task Title</TableHead>
              <TableHead className="w-[30%]">Description</TableHead>
              <TableHead className="w-[12%]">Status</TableHead>
              <TableHead className="w-[11%]">Due Date</TableHead>
              <TableHead className="w-[11%]">Created</TableHead>
              <TableHead className="w-[8%] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm">Loading tasks from backend API...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  <p className="text-sm font-medium">No tasks found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {search || statusFilter !== 'ALL'
                      ? 'Try adjusting your search query or filters.'
                      : 'Get started by creating your first task.'}
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
                <TableRow key={task.id} className="group transition-colors">
                  <TableCell className="font-semibold text-foreground">
                    {task.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs leading-relaxed max-w-xs truncate">
                    {task.description || <span className="opacity-40">No description</span>}
                  </TableCell>
                  <TableCell>{renderStatusBadge(task.status)}</TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                  <TableCell>{formatCreatedAt(task.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(task)}
                        title="Edit task"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleOpenDelete(task)}
                        title="Delete task"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Task Creation & Editing Dialog */}
      <TaskFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        taskToEdit={taskToEdit}
        onSuccess={onTaskCreatedOrUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        task={taskToDelete}
        onSuccess={onTaskDeleted}
      />
    </div>
  );
}
