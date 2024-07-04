import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';

interface Task {
  ID?: string;
  Task: string;
  IsCompleted: boolean;
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  tasks: Task[] = [];

  newTodoText = '';
  filterTodos = '';
  filterFinishedTasks = false;

  filteredTasks: Task[] = this.tasks;

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.getTasks();
  }

  getTasks() {
    this.http.get<Task[]>('/api/tasks').subscribe((tasks) => {
      this.tasks = tasks;
      this.updateTasks();
    });
  }

  uncompletedTasksNumber: number = this.tasks.filter(
    (task) => !task.IsCompleted
  ).length;

  toggleCompletionStatus(ID: string | undefined) {
    // Make sure the ID is not undefined
    if (ID == undefined) {
      console.error('Task is undefined');

      return;
    }

    // Update the completion status of task on the server
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .put(`/api/update/task/completion/${ID}`, null, { headers })
      .subscribe(() => {
        let task = this.tasks.find((task) => task.ID === ID);
        if (task == undefined) {
          console.error('Task is undefined');
          return;
        }
        task.IsCompleted = !task.IsCompleted;
        this.updateTasks();
      });
  }

  removeTask(ID: string | undefined) {
    // Make sure the ID is not undefined
    if (ID == undefined) {
      console.error('Task is undefined');

      return;
    }

    // Delete the task from the server
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http.delete(`/api/delete/task/${ID}`, { headers }).subscribe(() => {
      this.tasks = this.tasks.filter((task) => task.ID !== ID);
      this.updateTasks();
    });
  }

  updateUncompletedTasksNumber() {
    this.uncompletedTasksNumber = this.tasks.filter(
      (task) => !task.IsCompleted
    ).length;
  }

  // Add a new task to the server
  addTask() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .post<Task>('/api/add/task', { Task: this.newTodoText }, { headers })
      .subscribe((newTask) => {
        this.tasks.unshift(newTask);
        this.updateTasks();
      });
    this.newTodoText = '';
  }

  onKeyUpFilter() {
    this.filteredTasks = this.tasks.filter((task) =>
      task.Task.toLocaleLowerCase().includes(this.filterTodos.toLowerCase())
    );
  }

  onCheckedBoxFilterFinished(event: Boolean) {
    this.filter();
  }

  filter() {
    if (this.filterFinishedTasks) {
      this.filteredTasks = this.filteredTasks.filter(
        (task) =>
          !task.IsCompleted &&
          task.Task.toLocaleLowerCase().includes(this.filterTodos.toLowerCase())
      );
    } else {
      this.filteredTasks = this.tasks.filter((task) =>
        task.Task.toLocaleLowerCase().includes(this.filterTodos.toLowerCase())
      );
    }
  }

  updateTasks() {
    this.updateUncompletedTasksNumber();
    this.filter();
  }

  // Edit a task on the server
  editTask(taskID: string | undefined) {
    let newTaskText = document.getElementById(taskID + '_task')?.textContent;
    // Log the Task of the task that is being edited
    console.log('new task:', newTaskText);

    // Make sure the ID is not undefined or exit function
    if (taskID == undefined) {
      console.error('Task is undefined');

      return;
    }

    // Get the task by the ID and change the task.Task to match newTask
    let task = this.tasks.find((task) => task.ID === taskID);
    if (task == undefined) {
      console.error('Task is undefined');
      return;
    }

    let newTask = {
      ID: taskID,
      Task: newTaskText,
      IsCompleted: task.IsCompleted,
    };

    // Update the task on the server
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    this.http
      .put<Task>(`/api/update/task/${taskID}`, newTask, { headers })
      .subscribe(() => {
        this.updateTasks();
      });
  }

  enteredData(event: KeyboardEvent, taskID: string | undefined) {
    if (event.key === 'Enter') {
      (event.target as HTMLElement).blur(); // Manually remove focus
    }
  }
}
