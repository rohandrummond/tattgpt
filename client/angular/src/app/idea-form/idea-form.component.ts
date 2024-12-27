import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { LoaderComponent } from '../loader/loader.component';
import { Idea } from '../idea';
import { Ideas } from '../ideas';

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

  constructor(private http : HttpClient, private router : Router) {};
  
  ideaForm = new FormGroup({
    style: new FormControl<String | null>(null, Validators.required),
    color: new FormControl<String | null>(null, Validators.required),
    area: new FormControl<String | null>(null, Validators.required),
    size: new FormControl<String | null>(null, Validators.required),
    themes: new FormControl<String | null>(null)
  });

  serverResponse: Idea[] | null = null;
  isLoading: boolean = false;
  
  onSubmit = () => {
    this.ideaForm.markAllAsTouched();
    if (this.ideaForm.valid) {
      this.isLoading = true;
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
