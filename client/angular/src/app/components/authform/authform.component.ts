import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-authform',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './authform.component.html',
  styleUrl: './authform.component.css',
})
export class AuthformComponent {
  constructor(private readonly supabase: SupabaseService) {}

  formType = input.required<string>();
  formHeading = input.required<string>();

  authForm = new FormGroup({
    username: new FormControl<String | null>(null),
    email: new FormControl<String | null>(null),
    password: new FormControl<String | null>(null),
  });

  authError: string | null = null;

  async onSubmit(): Promise<void> {
    if (this.authError != null) {
      this.authError = null;
    }
    if (this.formType() == 'register') {
      const { username, email, password } = this.authForm.value as {
        username: string;
        email: string;
        password: string;
      };
      if (username && email && password) {
        try {
          await this.supabase.signUp(username, email, password);
        } catch (e) {
          if (e instanceof Error && e.message) {
            this.authError = e.message;
          } else {
            this.authError =
              'Sorry, there was an issue creating your account. Please try again later';
          }
        }
      } else {
        this.authError = 'Please include a username, email and password.';
      }
    } else {
      const { email, password } = this.authForm.value as {
        email: string;
        password: string;
      };
      if (email && password) {
        try {
          await this.supabase.signIn(email, password);
        } catch (e) {
          if (e instanceof Error && e.message) {
            this.authError = e.message;
          } else {
            this.authError =
              "Sorry, we weren't able to log you in. Please try again later";
          }
        }
      } else {
        this.authError = 'Please include a username, email and password.';
      }
    }
  }
}
