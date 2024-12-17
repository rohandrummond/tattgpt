import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { IdeaFormComponent } from './idea-form/idea-form.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CommonModule,
    IdeaFormComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {

}