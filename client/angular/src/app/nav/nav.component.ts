import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../supabase.service';

@Component({
  selector: 'app-nav',
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})

export class NavComponent {

  constructor(public readonly supabase: SupabaseService) {}

  async signOut(): Promise<void> {
    try {
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

}
