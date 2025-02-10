import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthRedirectService } from '../../services/authredirect.service';

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

  constructor(
    private router: Router, 
    public readonly supabase: SupabaseService, 
    private authRedirect: AuthRedirectService
  ) {}

  onSignInClick(): void {
    if (this.router.url === '/results') {
      this.authRedirect.setRedirectUrl('/results');
    }
    this.router.navigate(['/login']);
  }

  async signOut(): Promise<void> {
    await this.supabase.signOut();
  }

}