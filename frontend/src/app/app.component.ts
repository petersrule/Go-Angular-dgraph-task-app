import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Task {
  id?: string;
  task: string;
  isCompleted: boolean;
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  tasks: Task[] = [
    { id: '1', task: 'hExample Task 1', isCompleted: false },
    { id: '2', task: 'ZExample Task 2', isCompleted: true },
    { id: '3', task: 'XExample Task 3', isCompleted: false },
  ];

  newTodoText = '';
  filterTodos = '';
  filterFinishedTasks = false;

  filteredTasks: Task[] = this.tasks;

  uncompletedTasksNumber: number = this.tasks.filter(
    (task) => !task.isCompleted
  ).length;

  toggleCompletionStatus(index: number) {
    let task = this.tasks[index];
    task.isCompleted = !task.isCompleted;
    this.updateUncompletedTasksNumber();
  }

  removeTask(index: number) {
    this.tasks.splice(index, 1);
    this.updateUncompletedTasksNumber();
  }

  updateUncompletedTasksNumber() {
    this.uncompletedTasksNumber = this.tasks.filter(
      (task) => !task.isCompleted
    ).length;
  }

  addTask(task: string) {
    if (task == '') {
      return;
    }
    let id = Math.floor(Math.random() * 10000).toString();
    this.tasks.unshift({
      id,
      task,
      isCompleted: false,
    });
    this.updateUncompletedTasksNumber();
    this.newTodoText = '';
  }

  onKeyUpFilter() {
    this.filteredTasks = this.tasks.filter((task) =>
      task.task.toLocaleLowerCase().includes(this.filterTodos.toLowerCase())
    );
  }

  onCheckedBoxFilterFinished(event: Boolean) {
    this.filter();
  }

  filter() {
    if (this.filterFinishedTasks) {
      this.filteredTasks = this.filteredTasks.filter(
        (task) =>
          !task.isCompleted &&
          task.task.toLocaleLowerCase().includes(this.filterTodos.toLowerCase())
      );
    } else {
      this.filteredTasks = this.tasks.filter((task) =>
        task.task.toLocaleLowerCase().includes(this.filterTodos.toLowerCase())
      );
    }
  }
}
