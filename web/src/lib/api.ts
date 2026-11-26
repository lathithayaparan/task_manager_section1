import { CreateTaskPayload, Task, UpdateTaskPayload } from '@/types/task';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClientError extends Error {
  status: number;
  details?: string | string[];

  constructor(status: number, message: string, details?: string | string[]) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let details: string | string[] | undefined;

    try {
      const errorData = await response.json();
      if (errorData.message) {
        if (Array.isArray(errorData.message)) {
          details = errorData.message;
          errorMessage = errorData.message.join(', ');
        } else {
          errorMessage = errorData.message;
        }
      }
    } catch {
      // response was not JSON
    }

    throw new ApiClientError(response.status, errorMessage, details);
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  getTasks: (): Promise<Task[]> => request<Task[]>('/tasks'),

  getTask: (id: string): Promise<Task> => request<Task>(`/tasks/${id}`),

  createTask: (payload: CreateTaskPayload): Promise<Task> =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTask: (id: string, payload: UpdateTaskPayload): Promise<Task> =>
    request<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteTask: (id: string): Promise<{ message: string; id: string }> =>
    request<{ message: string; id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),
};
