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
  };
  generateImage(idea: Idea) {
    const apiUrl: string = 'https://localhost:7072/generate-image';
    this.http.post<String>(apiUrl, idea).subscribe({
      next: (response) => {
        console.log('Data fetched successfully');
        this.base64String = response.replace(/['"]+/g, '');
      },
      error: (e) => {
        console.error('Error fetching data: ', e)
      }
    })
    console.log(idea);
  }
}