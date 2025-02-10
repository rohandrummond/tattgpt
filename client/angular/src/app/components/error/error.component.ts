import { Component, input} from '@angular/core';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})

export class ErrorComponent {
  code = input.required<number>();
  message = input.required<string>();
}