import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CreateTask, Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private apiUrl = 'https://localhost:44383/api/tasks'; // change port to yours

  constructor(private http: HttpClient) {}

  getTasks() {
    return this.http.get<Task[]>(this.apiUrl);
  }

  createTask(task: CreateTask) {
    return this.http.post<Task>(this.apiUrl, task);
  }

  deleteTask(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}