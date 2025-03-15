import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthRedirectService } from '../../services/authredirect.service';
import { User } from '@supabase/supabase-js';
import { OpenAiService } from '../../services/openai.service';
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
    private router: Router, 
    public readonly supabase: SupabaseService, 
    public openAi : OpenAiService,
    private authRedirect: AuthRedirectService
  ) {};

  async ngOnInit(): Promise<void> {
    this.openAi.ideasObservable.subscribe({
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
    this.userData = await this.supabase.getUser();
  }

  generateImage = async (idea: Idea): Promise<void> => {
    this.disableImageButtons[idea.idea] = true;
    const htmlId: string = idea.idea.toLowerCase().split(' ').join('-');
    const ideaImg: HTMLImageElement | null = document.querySelector(`#${htmlId} img`);
    const imgLdr: HTMLDivElement | null = document.querySelector(`#${htmlId} .img-ldr-ctr`);
    if (ideaImg && imgLdr) {
      ideaImg.classList.add('hide');
      imgLdr.style.display = 'flex';
      const response: boolean | string = await this.openAi.generateImage(idea, 'results')
      imgLdr.style.display = 'none';
      ideaImg.classList.remove('hide');
      ideaImg.classList.add('show');
      if (this.disableSaveButtons[idea.idea] === true) {
        this.disableSaveButtons[idea.idea] = false;
      }
      if (!response) {
        this.trackErrors[idea.idea] = "Sorry, there was a problem generating your image.";
      }
    }
  }

  saveIdea = async (idea: Idea): Promise<void> => {
    if (this.userData) {
      if (!this.trackSavedIdeas.hasOwnProperty(idea.idea)) {
        try {
          this.disableSaveButtons[idea.idea] = true;
          idea.userId = this.userData.id as string;
          const response: number = await this.supabase.saveIdea(idea);
          this.trackSavedIdeas[idea.idea] = response;
        } catch(e) {
          if (e === 409) {
            this.trackErrors[idea.idea] = "This idea has already been saved.";
          } else {
            this.trackErrors[idea.idea] = "There was a problem saving your idea.";
          }
        }
      } else {
        this.disableSaveButtons[idea.idea] = true;
        if (!idea.image) {
          console.error("Cannot find bas64 string for image");
          return;
        }
        const appendedImage: AppendedImage = {
          ideaId: this.trackSavedIdeas[idea.idea],
          image: idea.image 
        }
        const response: boolean = await this.supabase.appendImage(appendedImage);
        if (!response) {
          this.trackErrors[idea.idea] = "There was a problem saving your idea.";
        }
      }
    }
  }

  acceptResultsAuthPrompt = (): void => {
    this.authRedirect.setRedirectUrl('/results');
    this.router.navigate(['/login'])
  }

}