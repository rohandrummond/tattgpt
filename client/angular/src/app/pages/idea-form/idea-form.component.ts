import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OpenAiService } from '../../services/openai.service';
import { NavComponent } from '../../components/nav/nav.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-idea-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    LoaderComponent,
    NavComponent,
    FooterComponent,
  ],
  templateUrl: './idea-form.component.html',
  styleUrls: ['./idea-form.component.css'],
})
export class IdeaFormComponent {
  constructor(private router: Router, private openAi: OpenAiService) {}

  ideaForm = new FormGroup({
    style: new FormControl<String | null>(''),
    size: new FormControl<String | null>(''),
    area: new FormControl<String | null>(''),
    color: new FormControl<String | null>(null),
    themes: new FormControl<String | null>(null),
  });

  isLoading: boolean = false;
  formError: string | null = null;

  onFormSubmit = async () => {
    this.ideaForm.markAllAsTouched();
    if (this.formError != null) {
      this.formError = null;
    }
    if (
      this.ideaForm.value.style &&
      this.ideaForm.value.size &&
      this.ideaForm.value.area &&
      this.ideaForm.value.color
    ) {
      this.isLoading = true;
      const result = await this.openAi.generateIdeas(this.ideaForm.value);
      if (result) {
        console.log(result);
        this.isLoading = false;
        this.router.navigate(['/results']);
      }
    } else {
      this.formError =
        'Please include your style, size, area and color preference.';
    }
  };
}
