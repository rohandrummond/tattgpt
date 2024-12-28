import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SupabaseService } from '../supabase.service';
import { NavComponent } from '../nav/nav.component';
import { Idea } from '../idea';


@Component({
  selector: 'app-results',
  imports: [
    CommonModule, 
    NavComponent
  ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css'
})

export class ResultsComponent {

  data: Idea[] | null = null; 

  base64String: string = '';

  constructor(private http : HttpClient, private router : Router, public readonly supabase: SupabaseService) {
    const navigation = this.router.getCurrentNavigation();
    const navigationState = navigation?.extras?.state?.['data'];
    if (!navigationState) {
      this.router.navigate(['/']);
    }
    this.data = navigationState;
  };

  generateImage = (idea: Idea) => {
    const apiUrl: string = 'https://localhost:7072/generate-image';
    this.http.post<String>(apiUrl, idea).subscribe({
      next: (response) => {
        console.log('Data fetched successfully');
        this.base64String = response.replace(/['"]+/g, '');
        if (this.data) {
          const index = this.data.findIndex(i => i === idea);
          if (index !== -1) {
            this.data[index] = { ...this.data[index], image: this.base64String };
          }
        }
      },
      error: (e) => {
        console.error('Error fetching data: ', e)
      }
    })
  }

  saveConcept = (idea: Idea) => {
    console.log(idea);
  }
  
}