import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class SignalRService {

  private hubConnection!: signalR.HubConnection;

  // Any component can subscribe to this to get notified
  taskCreated$ = new Subject<Task>();

  startConnection(token: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44383/hubs/tasks', {
        accessTokenFactory: () => token  // sends JWT with connection
      })
      .withAutomaticReconnect()          // auto reconnect if dropped
      .build();

    // Listen for TaskCreated event from server
    this.hubConnection.on('TaskCreated', (task: Task) => {
      this.taskCreated$.next(task);
    });

    this.hubConnection
      .start()
      .then(() => console.log(' SignalR connected'))
      .catch(err => console.error(' SignalR error:', err));
  }

  stopConnection() {
    this.hubConnection?.stop();
  }
}