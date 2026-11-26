'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task, TaskStatus } from '@/types/task';
import { api, ApiClientError } from '@/lib/api';
import { toast } from 'sonner';

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskToEdit?: Task | null;
  onSuccess: (task: Task) => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  taskToEdit,
  onSuccess,
}: TaskFormDialogProps) {
  const isEditing = Boolean(taskToEdit);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setDueDate(taskToEdit.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setDueDate('');
    }
    setErrors({});
  }, [taskToEdit, open]);

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.trim().length > 100) {
      errs.title = 'Title must be 100 characters or fewer';
    }

    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errs.dueDate = 'Due date must be in YYYY-MM-DD format';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        dueDate: dueDate || undefined,
      };

      let resultTask: Task;
      if (isEditing && taskToEdit) {
        resultTask = await api.updateTask(taskToEdit.id, payload);
        toast.success(`Task "${resultTask.title}" updated successfully!`);
      } else {
        resultTask = await api.createTask(payload);
        toast.success(`Task "${resultTask.title}" created successfully!`);
      }

      onSuccess(resultTask);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(`Error: ${err.message}`);
      } else {
        toast.error('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update task details below.'
              : 'Fill in the information to add a new task.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label htmlFor="task-title" className="text-sm font-semibold">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement authentication"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="task-desc" className="text-sm font-semibold">
              Description
            </label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes or details..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="task-status" className="text-sm font-semibold">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(val: TaskStatus) => setStatus(val)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="task-due-date" className="text-sm font-semibold">
                Due Date
              </label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.dueDate && (
                <p className="text-xs text-destructive font-medium">
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
