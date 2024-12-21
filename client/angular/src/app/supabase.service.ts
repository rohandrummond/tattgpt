import { Injectable } from '@angular/core'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { environment } from '../environments/environment'

@Injectable({ providedIn: 'root' })

export class SupabaseService {
  
  private supabase: SupabaseClient

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
  }

  signUp = (username: string, email: string, password: string) => {
    return this.supabase.auth.signUp({
      email, 
      password,
      options: {
        data: {
          username
        }
      }
    })
  }

  signIn = (email: string, password: string) => {
    return this.supabase.auth.signInWithPassword({ email, password});
  }

  signOut = () => {
    return this.supabase.auth.signOut();
  }

  getUser = () => {
    return this.supabase.auth.getUser();
  }

}