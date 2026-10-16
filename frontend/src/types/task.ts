export type TaskPriority = 'Baja' | 'Media' | 'Alta';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}
