import type { Task, CreateTaskInput } from '../types/task';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    let errorMessage = 'Ocurrió un error inesperado al procesar la solicitud.';
    if (data?.message) {
      if (Array.isArray(data.message)) {
        errorMessage = data.message.join('. ');
      } else {
        errorMessage = data.message;
      }
    } else if (data?.error) {
      errorMessage = data.error;
    }

    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const taskApi = {
  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<Task[]>(response);
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return handleResponse<Task>(response);
  },

  async deleteTask(id: string): Promise<{ success: boolean; message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    return handleResponse<{ success: boolean; message: string; id: string }>(response);
  },
};
