import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-authform',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './authform.component.html',
  styleUrl: './authform.component.css'
})
export class AuthformComponent {

  constructor( private readonly supabase: SupabaseService ) {};

  formType = input.required<string>();
  formHeading = input.required<string>();

  authForm = new FormGroup({
    username: new FormControl<String | null>(null, Validators.required),
    email: new FormControl<String | null>(null, Validators.required),
    password: new FormControl<String | null>(null, Validators.required),
  });

  authError: string | null = null;

  async onSubmit(): Promise<void> {
    if (this.authError != null) {
      this.authError = null;
    }
    if (this.formType() == 'register') {
      const { username, email, password } = this.authForm.value as { username: string; email: string; password: string };
      try {
        await this.supabase.signUp(username, email, password);
      } catch {
        this.authError = 'There was an issue creating your account.';
      }
    } else {
      const { email, password } = this.authForm.value as { email: string; password: string };
      try {
        await this.supabase.signIn(email, password);
      } catch {
        this.authError = 'There was an issue logging you in.';
      } 
    }
  }

}
