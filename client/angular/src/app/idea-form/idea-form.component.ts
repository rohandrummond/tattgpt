import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; 
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoaderComponent } from '../loader/loader.component';

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

  constructor(private http : HttpClient) {};
  
  ideaForm = new FormGroup({
    style: new FormControl<String | null>(null, Validators.required),
    color: new FormControl<String | null>(null, Validators.required),
    area: new FormControl<String | null>(null, Validators.required),
    size: new FormControl<String | null>(null, Validators.required),
    theme: new FormControl<String | null>(null)
  });

  serverResponse: JSON | null = null;
  isLoading: boolean = false;
  
  onSubmit(event: Event) {
    console.log("onSubmit function being triggered");
    this.ideaForm.markAllAsTouched();
    if (this.ideaForm.valid) {
      this.isLoading = true;
      console.log('Form Submitted');
      console.log(this.ideaForm.value);
      const apiUrl: string = 'https://localhost:7072';
      this.http.post<JSON>(apiUrl, this.ideaForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.serverResponse = response;
          console.log(this.serverResponse);
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
