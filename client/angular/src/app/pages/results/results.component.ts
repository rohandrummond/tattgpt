import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { User } from '@supabase/supabase-js';
import { OpenAiService } from '../../services/openai.service';
import { AuthRedirectService } from '../../services/authredirect.service';
import { Idea } from '../../interfaces/idea';
import { AppendedImage } from '../../interfaces/appended-image';
import { NavComponent } from '../../components/nav/nav.component';

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

  userData: User | null = null;  
  ideaData: Idea[] | null = null;
  trackSavedIdeas: { [name: string]: number } = {};
  trackErrors: { [name: string]: string } = {};
  disableSaveButtons: { [name: string]: boolean} = {};
  disableImageButtons: { [name: string]: boolean} = {};

  constructor(
    private http : HttpClient, 
    private router: Router, 
    private authRedirectService: AuthRedirectService,
    public readonly supabaseService: SupabaseService, 
    public openAiService : OpenAiService
  ) {};

  async ngOnInit(): Promise<void> {
    this.openAiService.ideasObservable.subscribe({
      next: (ideas: Idea[] | null) => {
        if (ideas) {
          this.ideaData = ideas;
          if (!Object.keys(this.disableSaveButtons).length && !Object.keys(this.disableImageButtons).length) {
            ideas.forEach((idea) => {
              this.disableSaveButtons[idea.idea] = false;
              this.disableImageButtons[idea.idea] = false;
            })
          }
        }
      },
      error: (err) => {
        console.error('Error fetching observable:', err);
      }
    });
    this.userData =  await this.supabaseService.getUser();
  }

  generateImage = async (idea: Idea): Promise<void> => {
    try {
      const response: boolean | string = await this.openAiService.generateImage(idea, 'results')
      if (response === true) {
        this.disableImageButtons[idea.idea] = true;
        if (this.disableSaveButtons[idea.idea] === true) {
          this.disableSaveButtons[idea.idea] = false;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  saveConcept = async (idea: Idea): Promise<void> => {
    if (this.userData) {
      if (!this.trackSavedIdeas.hasOwnProperty(idea.idea)) {
        try {
          idea.userId = this.userData.id as string;
          const response: number = await this.supabaseService.saveIdea(idea);
          this.trackSavedIdeas[idea.idea] = response;
          this.disableSaveButtons[idea.idea] = true;
        } catch (e) {
          if (e === 409) {
            console.error("Handle duplicate error")
            this.trackErrors[idea.idea] = "Idea has already been saved.";
          } else {
            console.error('Error occurred during Supabase Service request:', e);
            this.trackErrors[idea.idea] = "There was a problem saving this idea.";
          }
        }
      } else {
        try {
          if (!idea.image) {
            throw 'No base64 string available for image' 
          }
          const appendedImage: AppendedImage = {
            ideaId: this.trackSavedIdeas[idea.idea],
            image: idea.image 
          }
          const response: boolean = await this.supabaseService.appendImage(appendedImage);
          if (response) {
            this.disableSaveButtons[idea.idea] = true;
          }
        } catch (e) {
          console.error('Error occurred during Supabase Service request:', e);
        }
      }
    }
  }

  acceptResultsAuthPrompt = (): void => {
    this.authRedirectService.setRedirectUrl('/results');
    this.router.navigate(['/login'])
  }

}