import { Injectable } from '@angular/core'
import { environment } from '../environments/environment'
import { BehaviorSubject ,Observable } from 'rxjs'
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js'

@Injectable({ providedIn: 'root' })

export class SupabaseService {
  
  private supabase: SupabaseClient;
  
  private sessionSubject: BehaviorSubject<Session | null> = new BehaviorSubject<Session | null>(null);
  public sessionObservable: Observable<Session | null> = this.sessionSubject.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
    this.listenToAuthChanges();
  };

  private listenToAuthChanges(): void {
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        this.sessionSubject.next(session);
      } else if (event === 'SIGNED_OUT') {
        this.sessionSubject.next(null);
      }
    });
  };

  signUp = (username: string, email: string, password: string) => {
    return this.supabase.auth.signUp({
      email, 
      password,
      options: {
        data: {
          username
        }
      }
    });
  };

  signIn = (email: string, password: string) => {
    return this.supabase.auth.signInWithPassword({ email, password});
  };

  signOut = () => {
    return this.supabase.auth.signOut();
  };

};