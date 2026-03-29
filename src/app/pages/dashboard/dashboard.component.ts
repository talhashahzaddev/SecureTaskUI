import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Subscription } from 'rxjs';
import { SignalRService } from '../../services/signalr.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  tasks: Task[] = [];
  newTitle = '';
  newDescription = '';
  errorMessage = '';
  successMessage = '';
  notification = '';   


  private signalRSub!: Subscription;

  constructor(
    public auth: AuthService,
    private taskService: TaskService,
    private signalR: SignalRService
  ) {}

 ngOnInit() {
    this.loadTasks();
    this.connectSignalR();
  }

  ngOnDestroy() {
    this.signalRSub?.unsubscribe();
    this.signalR.stopConnection();
  }

 connectSignalR() {
    const token = this.auth.getToken()!;
    this.signalR.startConnection(token);

    // Listen for real-time task events
    this.signalRSub = this.signalR.taskCreated$.subscribe((task: Task) => {
      // Avoid duplicates — don't add if current user just created it
      const alreadyExists = this.tasks.some(t => t.id === task.id);
      if (!alreadyExists) {
        this.tasks.push(task);
      }

      // Show notification banner
      this.notification = ` New task added: "${task.title}"`;
      setTimeout(() => this.notification = '', 4000);
    });
  }

  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (data) => this.tasks = data,
      error: () => this.errorMessage = 'Failed to load tasks.'
    });
  }

  addTask() {
    if (!this.newTitle.trim()) {
      this.errorMessage = 'Title is required.';
      return;
    }

    this.taskService.createTask({
      title: this.newTitle,
      description: this.newDescription
    }).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.newTitle = '';
        this.newDescription = '';
        this.successMessage = 'Task added!';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = 'Failed to create task.'
    });
  }

  deleteTask(id: number) {
    if (!confirm('Delete this task?')) return;

    this.taskService.deleteTask(id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.successMessage = 'Task deleted.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = 'Failed to delete task.'
    });
  }

  logout() {
    this.signalR.stopConnection();
    this.auth.logout();
  }
}