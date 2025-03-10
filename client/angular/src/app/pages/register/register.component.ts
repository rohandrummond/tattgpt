import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { NavComponent } from '../../components/nav/nav.component';
import { AuthformComponent } from '../../components/authform/authform.component';

@Component({
  selector: 'app-register-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NavComponent,
    AuthformComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {

  constructor(
    private readonly supabase: SupabaseService, 
  ) {};

  registerForm = new FormGroup({
    username: new FormControl<String | null>(null, Validators.required),
    email: new FormControl<String | null>(null, Validators.required),
    password: new FormControl<String | null>(null, Validators.required),
  });
  
  registerError: string | null = null;

  async onSubmit(): Promise<void> {
    if (this.registerError != null) {
      this.registerError = null;
    }
    try {
      const { username, email, password } = this.registerForm.value as { username: string; email: string; password: string };
      await this.supabase.signUp(username, email, password);
    } catch {
      this.registerError = 'There was an issue creating your account.';
    }
  }
  
}
