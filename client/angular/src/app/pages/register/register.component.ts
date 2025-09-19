import { Component } from '@angular/core';
import { NavComponent } from '../../components/nav/nav.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthformComponent } from '../../components/authform/authform.component';

@Component({
  selector: 'app-register-form',
  imports: [NavComponent, AuthformComponent, FooterComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {}
