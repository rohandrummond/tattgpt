import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SupabaseService } from '../supabase.service';
import { OpenAiService } from '../openai.service';
import { AuthRedirectService } from '../authredirect.service';
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
  disableSaveButtons: { [name: string]: boolean} = {};
  disableImageButtons: { [name: string]: boolean} = {};
  constructor(
    private http : HttpClient, 
    private router: Router, 
    private authRedirectService: AuthRedirectService,
    public readonly supabaseService: SupabaseService, 
    public openAiService : OpenAiService
  ) {};
  ngOnInit(): void {
    this.openAiService.ideasObservable.subscribe({
      next: (ideas: Idea[] | null) => {
        if (ideas) {
          this.ideaData = ideas;
          ideas.forEach((idea) => {
            this.disableSaveButtons[idea.idea] = false;
            this.disableImageButtons[idea.idea] = false;
          })
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
  generateImage = async (idea: Idea): Promise<void> => {
    try {
      const response: boolean = await this.openAiService.generateImage(idea)
      if (response) {
        this.disableImageButtons[idea.idea] = true;
      }
    } catch (e) {
      console.error('Error occurred during Open AI Service request:', e);
    }
  }
  saveConcept = async (idea: Idea): Promise<void> => {
    try {
      idea.userId = this.userData?.user.id as string;
      const response: boolean = await this.supabaseService.saveIdea(idea);
      if (response) {
        this.disableSaveButtons[idea.idea] = true;
      }
    } catch (e) {
      console.error('Error occurred during Supabase Service request:', e);
    }
  }
  clickResultsAuthPrompt = (): void => {
    this.authRedirectService.setRedirectUrl('/results');
    this.router.navigate(['/login'])
  }
}