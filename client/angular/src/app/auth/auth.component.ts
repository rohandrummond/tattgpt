import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../supabase.service';
import { Session } from '@supabase/supabase-js';

@Component({
  selector: 'app-auth',
  imports: [CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  constructor(private readonly supabase: SupabaseService) {}

  formTemplate: string = "login";

  session: Session | null = null;

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

  async getSession(): Promise<void> {
    this.supabase.sessionObservable.subscribe((session) => {
      this.session = session;
    });
  };
}