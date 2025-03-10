import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { NavComponent } from '../../components/nav/nav.component';
import { AuthformComponent } from '../../components/authform/authform.component';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NavComponent,
    AuthformComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  constructor(
    private readonly supabase: SupabaseService, 
  ) {};

  loginForm = new FormGroup({
    email: new FormControl<String | null>(null, Validators.required),
    password: new FormControl<String | null>(null, Validators.required),
  });

  loginError: string | null = null;

  async onSubmit(): Promise<void> {
    if (this.loginError != null) {
      this.loginError = null;
    }
    const { email, password } = this.loginForm.value as { email: string; password: string };
    try {
      const result = await this.supabase.signIn(email, password);
    } catch {
      this.loginError = 'There was an issue logging you in.';
    }
  }

}