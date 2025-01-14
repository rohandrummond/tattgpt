import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../supabase.service';
import { AuthRedirectService } from '../authredirect.service';
import { firstValueFrom } from 'rxjs';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NavComponent,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {

  constructor(
    private readonly supabase: SupabaseService, 
    private router : Router,
    private authRedirectService: AuthRedirectService
  ) {};

  loginForm = new FormGroup({
    email: new FormControl<String | null>(null, Validators.required),
    password: new FormControl<String | null>(null, Validators.required),
  });

  loginError: string | null = null;

  async onSubmit(): Promise<void> {
    try {
      if (this.loginError != null) {
        this.loginError = null;
      }
      const { email, password } = this.loginForm.value as { email: string; password: string };
      const { error } = await this.supabase.signIn(email, password);
      if (error) throw error;
      const redirectUrl: string = await firstValueFrom(this.authRedirectService.redirectObservable); 
      this.router.navigate([redirectUrl]);
      this.authRedirectService.setRedirectUrl('/');
    } catch (error) {
      if (error instanceof Error) {
        this.loginError = error.message;
      }
    }
  }
}