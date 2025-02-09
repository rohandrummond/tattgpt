import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private supabaseService: SupabaseService) {}
  canActivate(): Observable<boolean> {
    return this.supabaseService.sessionObservable.pipe(
      map(session => !!session),
      tap(session => {
        if (!session) {
          this.router.navigate(['/unauthorized']);
        }
      }),
      catchError(error => {
        console.error('Authorisation check failed:', error);
        this.router.navigate(['/unauthorized']);
        return [false]; 
      })
    );
  }
}