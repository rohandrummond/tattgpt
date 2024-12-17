import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';

interface Idea {
  idea: string;
  description: string;
  style: string;
  size: string;
  color: string;
  placement: string;
}

interface Ideas {
  tattooIdeas: Idea[];
}

@Component({
  selector: 'app-idea-form',
  imports: [
    ReactiveFormsModule, 
    CommonModule,
    LoaderComponent
  ],
  templateUrl: './idea-form.component.html',
  styleUrls: ['./idea-form.component.css']
})

export class IdeaFormComponent {

  constructor(private http : HttpClient, private router : Router) {};
  
  ideaForm = new FormGroup({
    style: new FormControl<String | null>(null, Validators.required),
    color: new FormControl<String | null>(null, Validators.required),
    area: new FormControl<String | null>(null, Validators.required),
    size: new FormControl<String | null>(null, Validators.required),
    theme: new FormControl<String | null>(null)
  });

  serverResponse: Idea[] | null = null;
  isLoading: boolean = false;
  
  onSubmit() {
    console.log("onSubmit function being triggered");
    this.ideaForm.markAllAsTouched();
    if (this.ideaForm.valid) {
      this.isLoading = true;
      console.log('Form Submitted');
      console.log(this.ideaForm.value);
      const apiUrl: string = 'https://localhost:7072/generate-ideas';
      this.http.post<Ideas>(apiUrl, this.ideaForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.serverResponse = response.tattooIdeas;
          this.router.navigate(['/results'], { state: { data: this.serverResponse } });
        },
        error: (e) => {
          console.error('Error fetching data: ', e)
        }    
      });
    } else {
      console.log('Form is not valid');
    }
  }

}
