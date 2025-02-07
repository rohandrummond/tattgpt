import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { OpenAiService } from '../../services/openai.service';
import { User } from '@supabase/supabase-js';
import { Idea } from '../../interfaces/idea';
import { NavComponent } from '../../components/nav/nav.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-saved-ideas',
  imports: [
    CommonModule,
    NavComponent,
    LoaderComponent
  ],
  templateUrl: './saved-ideas.component.html',
  styleUrl: './saved-ideas.component.css'
})

export class SavedIdeasComponent {

  constructor(
    public readonly supabaseService: SupabaseService,
    public openAiService: OpenAiService
  ) {};

  isLoading: boolean = false;
  userData: User | null = null;
  ideaData: Idea[] | null = null;
  ideaHtmlIds: { [idea: string]: string} = {};

  async ngOnInit() {
    this.isLoading = true;
    this.userData =  await this.supabaseService.getUser();
    if (this.userData) {
      this.ideaData = await this.supabaseService.fetchIdeas(this.userData.id);
      if (this.ideaData) {
        this.ideaData.forEach((idea) => {
          this.ideaHtmlIds[idea.idea] = _.kebabCase(idea.idea);
        })
      }
      console.log(this.ideaHtmlIds);
      this.isLoading = false;
    }
  }

  generateImage = async (idea: Idea): Promise<void> => {
    try {
      const base64String: boolean | string = await this.openAiService.generateImage(idea, 'my-ideas');
      const ideaImg: HTMLImageElement | null = document.querySelector(`#${this.ideaHtmlIds[idea.idea]} img`);
      const generateImgBtn: HTMLButtonElement | null = document.querySelector(`#${this.ideaHtmlIds[idea.idea]} .gen-img-btn`);
      const saveImgBtn: HTMLButtonElement | null = document.querySelector(`#${this.ideaHtmlIds[idea.idea]} .save-img-btn`);
      console.log(ideaImg)
      if (ideaImg && generateImgBtn && saveImgBtn) {
        ideaImg.src = `data:image/png;base64,${base64String}`
        generateImgBtn.classList.add("hide");
        saveImgBtn.classList.remove("hide");
        saveImgBtn.classList.add("show");
      } else {
        console.error("Cannot find img, generate image, or save image button")
      }
    } catch(e) {
      console.error(e);
    }
  }
  
}