import { Component } from '@angular/core';
import { NavComponent } from '../../components/nav/nav.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ErrorComponent } from '../../components/error/error.component';

@Component({
  selector: 'app-not-found',
  imports: [NavComponent, ErrorComponent, FooterComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent {}
