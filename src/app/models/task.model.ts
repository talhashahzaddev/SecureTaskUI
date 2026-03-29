export interface Task {
  id: number;
  title: string;
  description: string;
  createdByUserId: number;
}

export interface CreateTask {
  title: string;
  description: string;
}