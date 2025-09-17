import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthRedirectService } from './authredirect.service';
import {
  createClient,
  SupabaseClient,
  Session,
  AuthChangeEvent,
  User,
  AuthError,
} from '@supabase/supabase-js';
import { Idea } from '../interfaces/idea';
import { AppendedImage } from '../interfaces/appended-image';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  private sessionSubject: BehaviorSubject<Session | null> =
    new BehaviorSubject<Session | null>(null);
  public sessionObservable: Observable<Session | null> =
    this.sessionSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private authRedirectService: AuthRedirectService
  ) {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
    this.listenToAuthChanges();
  }

  private listenToAuthChanges = () => {
    this.supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'INITIAL_SESSION'
        ) {
          this.sessionSubject.next(session);
        } else if (event === 'SIGNED_OUT') {
          this.sessionSubject.next(null);
        }
      }
    );
  };

  signUp = async (username: string, email: string, password: string) => {
    try {
      const { error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      if (error) throw error;
      const redirectUrl: string = await firstValueFrom(
        this.authRedirectService.redirectObservable
      );
      this.router.navigate([redirectUrl]);
      this.authRedirectService.setRedirectUrl('/');
    } catch (e) {
      console.error('Failed to sign up user. ', e);
      if (e instanceof AuthError) {
        throw new Error(e.message);
      } else {
        throw new Error();
      }
    }
  };

  signIn = async (email: string, password: string) => {
    try {
      const { error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const redirectUrl: string = await firstValueFrom(
        this.authRedirectService.redirectObservable
      );
      this.router.navigate([redirectUrl]);
      this.authRedirectService.setRedirectUrl('/');
    } catch (e) {
      console.error('Failed to sign in user. ', e);
      if (e instanceof AuthError) {
        throw new Error(e.message);
      } else {
        throw new Error();
      }
    }
  };

  signOut = async () => {
    try {
      await this.supabase.auth.signOut();
      this.router.navigate(['/login']);
    } catch (e) {
      console.error('Failed to sign out user. ', e);
    }
  };

  getUser = async (): Promise<User | null> => {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  };

  saveIdea = (idea: Idea): Promise<number> => {
    return new Promise((resolve, reject) => {
      this.http
        .post<number>('https://localhost:7072/save-idea', idea, {
          observe: 'response',
        })
        .subscribe({
          next: (response) => {
            const insertedId: number | null = response.body;
            if (response.status === 200 && insertedId != null) {
              resolve(insertedId);
            }
          },
          error: (e) => {
            console.error('Failed to save idea. ', e.message);
            if (e.status === 409) {
              reject(e.status);
            }
            reject(e.message);
          },
        });
    });
  };

  appendImage = (appendedImage: AppendedImage): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      this.http
        .post<any>('https://localhost:7072/append-image', appendedImage, {
          observe: 'response',
        })
        .subscribe({
          next: (response) => {
            if (response.status === 200) {
              resolve(true);
            } else {
              reject('Failed to append image');
            }
          },
          error: (e) => {
            reject('Failed to append image: ' + e.message);
          },
        });
    });
  };

  fetchIdeas = async (userId: string): Promise<Idea[] | null> => {
    try {
      const { data, error } = await this.supabase
        .from('ideas')
        .select()
        .eq('user_id', userId);
      if (error) throw error;
      if (data) {
        data.forEach((idea) => {
          idea.id = idea.id.toString();
          if (idea.image) {
            idea.image = 'data:image/png;base64,' + idea.image;
          }
        });
      }
      return data;
    } catch (e) {
      console.error('Failed to fetch ideas. ', e);
      return null;
    }
  };

  deleteIdea = (idea: Idea): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      this.http
        .delete('https://localhost:7072/delete-idea', {
          observe: 'response',
          body: JSON.stringify(idea),
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
          }),
        })
        .subscribe({
          next: (response) => {
            if (response.status === 200) {
              resolve(true);
            } else {
              reject('Failed to append image');
            }
          },
          error: (e) => {
            reject('Failed to delete idea: ' + e.message);
          },
        });
    });
  };
}
