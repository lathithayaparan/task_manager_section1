import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [
    {
      id: '1a2b3c4d-0001-4000-8000-000000000001',
      title: 'Setup development environment',
      description: 'Clone repository and install dependencies for frontend and backend.',
      status: TaskStatus.DONE,
      dueDate: '2026-12-01',
      createdAt: new Date('2026-11-20T08:00:00Z').toISOString(),
    },
    {
      id: '1a2b3c4d-0002-4000-8000-000000000002',
      title: 'Build task management CRUD endpoints',
      description: 'Implement GET, POST, PATCH, and DELETE with class-validator DTOs.',
      status: TaskStatus.IN_PROGRESS,
      dueDate: '2026-12-05',
      createdAt: new Date('2026-11-21T09:30:00Z').toISOString(),
    },
    {
      id: '1a2b3c4d-0003-4000-8000-000000000003',
      title: 'Implement shadcn/ui frontend table and dialog',
      description: 'Build Next.js app router interface with status badges and confirmation dialog.',
      status: TaskStatus.TODO,
      dueDate: '2026-12-10',
      createdAt: new Date('2026-11-22T10:15:00Z').toISOString(),
    },
  ];

  findAll(): Task[] {
    return this.tasks;
  }

  findOne(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" does not exist`);
    }
    return task;
  }

  create(createTaskDto: CreateTaskDto): Task {
    const newTask: Task = {
      id: uuidv4(),
      title: createTaskDto.title.trim(),
      description: createTaskDto.description?.trim(),
      status: createTaskDto.status || TaskStatus.TODO,
      dueDate: createTaskDto.dueDate,
      createdAt: new Date().toISOString(),
    };

    this.tasks.push(newTask);
    return newTask;
  }

  update(id: string, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id);

    if (updateTaskDto.title !== undefined) {
      task.title = updateTaskDto.title.trim();
    }
    if (updateTaskDto.description !== undefined) {
      task.description = updateTaskDto.description.trim();
    }
    if (updateTaskDto.status !== undefined) {
      task.status = updateTaskDto.status;
    }
    if (updateTaskDto.dueDate !== undefined) {
      task.dueDate = updateTaskDto.dueDate;
    }

    return task;
  }

  remove(id: string): { message: string; id: string } {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task with ID "${id}" does not exist`);
    }

    this.tasks.splice(index, 1);
    return { message: `Task "${id}" successfully deleted`, id };
  }
}
