import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})

export class LoginFormComponent {

  constructor(private readonly supabase: SupabaseService) {}

  loginForm = new FormGroup({
    email: new FormControl<String | null>(null, Validators.required),
    password: new FormControl<String | null>(null, Validators.required),
  });

  async onSubmit(): Promise<void> {
    try {
      console.log("Login function being triggered with the below data: ")
      console.log(this.loginForm.value);
      const { email, password } = this.loginForm.value as { email: string; password: string };
      const { error } = await this.supabase.signIn(email, password);
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      console.log("User logged in successfully.")
    }
  }
}