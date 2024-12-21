import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../login-form/login-form.component';
import { RegisterFormComponent } from '../register-form/register-form.component';

@Component({
  selector: 'app-auth',
  imports: [
    CommonModule,
    LoginFormComponent,
    RegisterFormComponent
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  formTemplate: string = "login";
  applyLogin = () => {
    this.formTemplate = "login"
  }
  applyRegister = () => {
    this.formTemplate = "register"
  }
}