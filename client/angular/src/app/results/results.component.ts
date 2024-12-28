import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from '../supabase.service';
import { OpenAiService } from '../openai.service';
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
  constructor(private http : HttpClient, public readonly supabase: SupabaseService, public openAiService : OpenAiService) {
  };
  ngOnInit(): void {
    this.openAiService.ideasObservable.subscribe({
      next: (ideas: Idea[] | null) => {
        if (ideas) {
          this.data = ideas;
        }
      },
      error: (err) => {
        console.error('Error fetching observable:', err);
      }
    });
  }
  generateImage = async (idea: Idea) => {
    try {
      const response: boolean = await this.openAiService.generateImage(idea)
      if (response) {
        console.log('Open AI Service indicating successful request.');
        console.log(this.data)
      }
    } catch (e) {
      console.error('Error occurred during Open AI Service request:', e);
    }
  }
  saveConcept = (idea: Idea) => {
    console.log(idea);
  }
}