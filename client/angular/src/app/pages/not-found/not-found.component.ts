import { Component } from '@angular/core';
import { NavComponent } from '../../components/nav/nav.component';
import { ErrorComponent } from '../../components/error/error.component';

@Component({
  selector: 'app-not-found',
  imports: [ 
    NavComponent,
    ErrorComponent 
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})

export class NotFoundComponent {

}
