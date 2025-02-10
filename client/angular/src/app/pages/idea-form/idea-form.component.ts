import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OpenAiService } from '../../services/openai.service';
import { NavComponent } from '../../components/nav/nav.component';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-idea-form',
  imports: [
    ReactiveFormsModule, 
    CommonModule,
    LoaderComponent,
    NavComponent
  ],
  templateUrl: './idea-form.component.html',
  styleUrls: ['./idea-form.component.css']
})

export class IdeaFormComponent {

  constructor(
    private router : Router, 
    private openAi : OpenAiService
  ) {};
  
  ideaForm = new FormGroup({
    style: new FormControl<String | null>(null, Validators.required),
    color: new FormControl<String | null>(null, Validators.required),
    area: new FormControl<String | null>(null, Validators.required),
    size: new FormControl<String | null>(null, Validators.required),
    themes: new FormControl<String | null>(null)
  });

  isLoading: boolean = false;
  
  onFormSubmit = async () => {
    this.ideaForm.markAllAsTouched();
    this.isLoading = true;
    if (this.ideaForm.valid) {
      const result = await this.openAi.generateIdeas(this.ideaForm.value)
      if (result) {
        this.isLoading = false;
        this.router.navigate(['/results']);
      }
    }
  }

}