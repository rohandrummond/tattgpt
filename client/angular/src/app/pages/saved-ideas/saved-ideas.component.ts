import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { OpenAiService } from '../../services/openai.service';
import { User } from '@supabase/supabase-js';
import { Idea } from '../../interfaces/idea';
import { AppendedImage } from '../../interfaces/appended-image';
import { NavComponent } from '../../components/nav/nav.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LoaderComponent } from '../../components/loader/loader.component';
import { slugify } from '../../utils/slugify';

@Component({
  selector: 'app-saved-ideas',
  imports: [
    CommonModule,
    RouterLink,
    NavComponent,
    LoaderComponent,
    FooterComponent,
  ],
  templateUrl: './saved-ideas.component.html',
  styleUrl: './saved-ideas.component.css',
})
export class SavedIdeasComponent {
  constructor(
    public readonly supabase: SupabaseService,
    public openAi: OpenAiService
  ) {}

  isLoading: boolean = false;
  userData: User | null = null;
  ideaData: Idea[] | null = null;
  ideaHtmlIds: { [idea: string]: string } = {};
  trackErrors: { [name: string]: string } = {};

  async ngOnInit() {
    this.isLoading = true;
    this.userData = await this.supabase.getUser();
    if (this.userData) {
      this.ideaData = await this.supabase.fetchIdeas(this.userData.id);
      if (this.ideaData) {
        this.ideaData.forEach((idea) => {
          this.ideaHtmlIds[idea.idea] = slugify(idea.idea);
        });
      }
      this.isLoading = false;
    }
  }

  generateImage = async (idea: Idea): Promise<void> => {
    const ideaImg: HTMLImageElement | null = document.querySelector(
      `#${this.ideaHtmlIds[idea.idea]} img`
    );
    const imgLdr: HTMLDivElement | null = document.querySelector(
      `#${this.ideaHtmlIds[idea.idea]} .img-ldr-ctr`
    );
    const generateImgBtn: HTMLButtonElement | null = document.querySelector(
      `#${this.ideaHtmlIds[idea.idea]} .gen-img-btn`
    );
    const saveImgBtn: HTMLButtonElement | null = document.querySelector(
      `#${this.ideaHtmlIds[idea.idea]} .save-img-btn`
    );
    if (ideaImg && imgLdr && generateImgBtn && saveImgBtn) {
      generateImgBtn.disabled = true;
      ideaImg.classList.add('hide');
      imgLdr.style.display = 'flex';
      const base64String: boolean | string = await this.openAi.generateImage(
        idea,
        'my-ideas'
      );
      imgLdr.style.display = 'none';
      ideaImg.src = `data:image/png;base64,${base64String}`;
      ideaImg.classList.remove('hide', 'card-img-ph');
      ideaImg.classList.add('show');
      generateImgBtn.classList.add('hide');
      saveImgBtn.classList.remove('hide');
      saveImgBtn.classList.add('show');
    }
  };

  appendImage = async (idea: Idea): Promise<void> => {
    const ideaImg: HTMLImageElement | null = document.querySelector(
      `#${this.ideaHtmlIds[idea.idea]} img`
    );
    const saveImgBtn: HTMLButtonElement | null = document.querySelector(
      `#${this.ideaHtmlIds[idea.idea]} .save-img-btn`
    );
    if (idea.id && ideaImg && ideaImg.src && saveImgBtn) {
      saveImgBtn.disabled = true;
      const base64String: string = ideaImg.src.replace(
        'data:image/png;base64,',
        ''
      );
      const appendedImage: AppendedImage = {
        ideaId: parseInt(idea.id),
        image: base64String,
      };
      const result: boolean = await this.supabase.appendImage(appendedImage);
      if (!result) {
        this.trackErrors[idea.idea] =
          'Sorry, there was a problem saving your idea.';
      }
    }
  };

  deleteIdea = async (deletedIdea: Idea): Promise<void> => {
    const deleteBtn: HTMLButtonElement | null = document.querySelector(
      `#${this.ideaHtmlIds[deletedIdea.idea]} .btn-dlt`
    );
    if (deleteBtn) {
      deleteBtn.disabled = true;
    }
    const result = await this.supabase.deleteIdea(deletedIdea);
    if (result) {
      if (this.ideaData && this.userData) {
        delete this.ideaHtmlIds[deletedIdea.idea];
        const deleteIndex = this.ideaData.findIndex(
          (existingIdea) => existingIdea.idea == deletedIdea.idea
        );
        if (deleteIndex !== -1) {
          const deleteResult = this.ideaData.splice(deleteIndex, 1);
          console.log(deleteResult);
        }
      }
    } else {
      this.trackErrors[deletedIdea.idea] =
        'Sorry, there was a problem deleting your idea.';
    }
  };
}
