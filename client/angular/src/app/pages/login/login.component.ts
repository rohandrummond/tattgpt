import { Component } from '@angular/core';
import { NavComponent } from '../../components/nav/nav.component';
import { AuthformComponent } from '../../components/authform/authform.component';

@Component({
  selector: 'app-login-form',
  imports: [NavComponent, AuthformComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {}
