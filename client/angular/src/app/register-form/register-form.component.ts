import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-register-form',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.css'
})

export class RegisterFormComponent {

  constructor(private readonly supabase: SupabaseService) {}

  registerForm = new FormGroup({
    username: new FormControl<String | null>(null, Validators.required),
    email: new FormControl<String | null>(null, Validators.required),
    password: new FormControl<String | null>(null, Validators.required),
  });

  async onSubmit(): Promise<void> {
    try {
      console.log("Sign up function being triggered with the below data: ")
      console.log(this.registerForm.value);
      const { username, email, password } = this.registerForm.value as { username: string; email: string; password: string };
      const { error } = await this.supabase.signUp(username, email, password)
      if (error) throw error
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      console.log("User created successfully.")
    }
  }
}
