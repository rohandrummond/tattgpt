import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../supabase.service';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-register-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NavComponent
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})

export class RegisterComponent {

  constructor(private readonly supabase: SupabaseService, private router : Router) {}  

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
      this.router.navigate(['/']);
    }
  }
}
