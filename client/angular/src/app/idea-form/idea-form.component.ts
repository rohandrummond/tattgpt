import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OpenAiService } from '../openai.service';
import { NavComponent } from '../nav/nav.component';
import { LoaderComponent } from '../loader/loader.component';

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

  constructor(private http : HttpClient, private router : Router, private openAiService : OpenAiService) {};
  
  ideaForm = new FormGroup({
    style: new FormControl<String | null>(null, Validators.required),
    color: new FormControl<String | null>(null, Validators.required),
    area: new FormControl<String | null>(null, Validators.required),
    size: new FormControl<String | null>(null, Validators.required),
    themes: new FormControl<String | null>(null)
  });

  isLoading: boolean = false;
  
  onSubmit = async () => {
    this.ideaForm.markAllAsTouched();
    this.isLoading = true;
    if (this.ideaForm.valid) {
      try {
        const response: boolean = await this.openAiService.generateIdeas(this.ideaForm.value)
        if (response) {
          this.isLoading = false;
          this.router.navigate(['/results']);
        }
      } catch (e) {
        console.error('Error occurred during API request:', e);
      }
    }
  }

}