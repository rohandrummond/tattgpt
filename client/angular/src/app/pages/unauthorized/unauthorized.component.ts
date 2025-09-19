import { Component } from '@angular/core';
import { NavComponent } from '../../components/nav/nav.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ErrorComponent } from '../../components/error/error.component';

@Component({
  selector: 'app-unauthorized',
  imports: [NavComponent, ErrorComponent, FooterComponent],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.css',
})
export class UnauthorizedComponent {}
