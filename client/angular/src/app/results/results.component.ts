import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Idea } from '../idea';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-results',
  imports: [CommonModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})

export class ResultsComponent {
  data: Idea[] | null = null; 
  base64String: string = '';
  constructor(private http : HttpClient, private router : Router) {
    const navigation = this.router.getCurrentNavigation();
    this.data = navigation?.extras?.state?.['data'];
    console.log(this.data);
  };
  generateImage(idea: Idea) {
    const apiUrl: string = 'https://localhost:7072/generate-image';
    this.http.post<String>(apiUrl, idea).subscribe({
      next: (response) => {
        console.log('Data fetched successfully');
        this.base64String = response.replace(/['"]+/g, '');
        if (this.data) {
          const index = this.data.findIndex(i => i === idea);
          if (index !== -1) {
            this.data[index] = { ...this.data[index], image: this.base64String }; // Assuming `image` is a field in the Idea interface
          }
        }
        console.log(this.data)
      },
      error: (e) => {
        console.error('Error fetching data: ', e)
      }
    })
  }
}