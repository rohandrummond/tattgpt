import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { OpenAiService } from '../../services/openai.service';
import { User } from '@supabase/supabase-js';
import { Idea } from '../../interfaces/idea';
import { AppendedImage } from '../../interfaces/appended-image';
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
    public readonly supabase: SupabaseService,
    public openAi: OpenAiService
  ) {};

  isLoading: boolean = false;
  userData: User | null = null;
  ideaData: Idea[] | null = null;
  ideaHtmlIds: { [idea: string]: string} = {};

  async ngOnInit() {
    this.isLoading = true;
    this.userData =  await this.supabase.getUser();
    if (this.userData) {
      this.ideaData = await this.supabase.fetchIdeas(this.userData.id);
      if (this.ideaData) {
        this.ideaData.forEach((idea) => {
          this.ideaHtmlIds[idea.idea] = _.kebabCase(idea.idea);
        })
      }
      this.isLoading = false;
    }
  }

  generateImage = async (idea: Idea): Promise<void> => {
    const base64String: boolean | string = await this.openAi.generateImage(idea, 'my-ideas');
    const ideaImg: HTMLImageElement | null = document.querySelector(`#${this.ideaHtmlIds[idea.idea]} img`);
    const generateImgBtn: HTMLButtonElement | null = document.querySelector(`#${this.ideaHtmlIds[idea.idea]} .gen-img-btn`);
    const saveImgBtn: HTMLButtonElement | null = document.querySelector(`#${this.ideaHtmlIds[idea.idea]} .save-img-btn`);
    if (ideaImg && generateImgBtn && saveImgBtn) {
      ideaImg.src = `data:image/png;base64,${base64String}`
      generateImgBtn.classList.add('hide');
      saveImgBtn.classList.remove('hide');
      saveImgBtn.classList.add('show');
    }
  }

  appendImage = async (idea: Idea): Promise<void> => {
    const ideaImg: HTMLImageElement | null = document.querySelector(`#${this.ideaHtmlIds[idea.idea]} img`);
    const saveImgBtn: HTMLButtonElement | null = document.querySelector(`#${this.ideaHtmlIds[idea.idea]} .save-img-btn`);
    if (idea.id && ideaImg && ideaImg.src && saveImgBtn) {
      const base64String: string = ideaImg.src.replace('data:image/png;base64,', '')
      const appendedImage: AppendedImage = {
        ideaId: parseInt(idea.id),
        image: base64String
      }
      const result: boolean = await this.supabase.appendImage(appendedImage);
      if (result) {
        saveImgBtn.disabled = true;
      }
    }
  }

  deleteIdea = async (deletedIdea: Idea): Promise<void> => {
    const result = await this.supabase.deleteIdea(deletedIdea);
    if (result && this.ideaData && this.userData) {
      delete this.ideaHtmlIds[deletedIdea.idea];
      const deleteIndex = this.ideaData.findIndex(existingIdea => existingIdea.idea = deletedIdea.idea);
      if (deleteIndex !== -1) {
        this.ideaData.splice(deleteIndex, 1);
      }
    }
  }
 
}