// Auto-generated minimal TypeScript types from backend/openapi.yaml

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canAssignTasks: boolean;
}

export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assignedUserId?: number | null;
  assignedUser?: User | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface TaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  assignedUserId?: number | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TasksResponse {
  data: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
}
