import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthRedirectService } from '../../services/auth-redirect.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, CommonModule, FooterComponent],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
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

  setDisplay = (selector: string, display: string) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) el.style.display = display;
  };

  toggleClass = (selector: string, className: string, add: boolean) => {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) el.classList.toggle(className, add);
  };

  openMobileOverlay = () => {
    this.setDisplay('.mobile-nav-ctr', 'none');
    this.toggleClass('.full-vp.ctr', 'ctr', false);
    this.setDisplay('app-footer', 'none');
    this.setDisplay('.mobile-nav-overlay', 'flex');
  };

  closeMobileOverlay = () => {
    this.setDisplay('.mobile-nav-ctr', 'flex');
    this.toggleClass('.full-vp', 'ctr', true);
    this.setDisplay('app-footer', 'block');
    this.setDisplay('.mobile-nav-overlay', 'none');
  };
}
