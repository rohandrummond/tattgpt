import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from '../supabase.service';
import { OpenAiService } from '../openai.service';
import { NavComponent } from '../nav/nav.component';
import { Idea } from '../idea';
import { Session } from '@supabase/supabase-js';

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
  ideaData: Idea[] | null = null;
  userData: Session | null = null;
  base64String: string = '';
  constructor(private http : HttpClient, public readonly supabaseService: SupabaseService, public openAiService : OpenAiService) {
  };
  ngOnInit(): void {
    this.openAiService.ideasObservable.subscribe({
      next: (ideas: Idea[] | null) => {
        if (ideas) {
          this.ideaData = ideas;
        }
      },
      error: (err) => {
        console.error('Error fetching observable:', err);
      }
    });
    this.supabaseService.sessionObservable.subscribe({
      next: (session: Session | null) => {
        if (session) {
          this.userData = session;
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
        console.log(this.ideaData)
      }
    } catch (e) {
      console.error('Error occurred during Open AI Service request:', e);
    }
  }
  saveConcept = async (idea: Idea) => {
    try {
      idea.userId = this.userData?.user.id as string;
      const response: boolean = await this.supabaseService.saveIdea(idea);
      if (response) {
        console.log('Supabase Service indicating successful insertion.');
      }
    } catch (e) {
      console.error('Error occurred during Supabase Service request:', e);
    }
  }
}