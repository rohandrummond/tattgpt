import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  data: string = '';
  constructor(private http : HttpClient) {};
  fetchData() {
    const apiUrl: string = 'http://localhost:5095/helloworld';
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