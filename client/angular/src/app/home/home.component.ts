import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private http : HttpClient) {};
  base64String: string = '';
  fetchData() {
    const apiUrl: string = 'https://localhost:7072/generate-image';
    this.http.get(apiUrl, { responseType: 'text' }).subscribe({
      next: (response) => {
        console.log('Data fetched successfully');
        this.base64String = response.replace(/['"]+/g, '');
      },
      error: (e) => {
        console.error('Error fetching data: ', e)
      }
    })
  }
}
