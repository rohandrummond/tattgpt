import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../login-form/login-form.component';
import { RegisterFormComponent } from '../register-form/register-form.component';
import { SupabaseService } from '../supabase.service';

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
  constructor(private readonly supabase: SupabaseService) {}
  formTemplate: string = "login";
  applyLogin = () => {
    this.formTemplate = "login"
  }
  applyRegister = () => {
    this.formTemplate = "register"
  }

  async signOut(): Promise<void> {
    try {
      console.log("Sign out being triggered.")
      const { error } = await this.supabase.signOut();
      if (error) throw error;
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      console.log("User logged out successfully.")
    }
  }

  async getUser(): Promise<void> {
    try {
      console.log("Get user being triggered.")
      const { data, error } = await this.supabase.getUser();
      if (error) throw error
      console.log(data)
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      console.log("User data fetched successfully.")
    }
  }
}