import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { IdeaFormComponent } from './idea-form/idea-form.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CommonModule,
    IdeaFormComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  data: string = '';
  constructor(private http : HttpClient) {};
  fetchData() {
    const apiUrl: string = 'https://localhost:7072';
    this.http.get(apiUrl, { responseType: 'text' }).subscribe({
      next: (response) => {
        this.data = response;
        console.log('Data fetched successfully: ', this.data);
      },
      error: (e) => {
        console.error('Error fetching data: ', e)
      }
    })
  }
}