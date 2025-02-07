import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { User } from '@supabase/supabase-js';
import { NavComponent } from '../../components/nav/nav.component';
import { LoaderComponent } from '../../components/loader/loader.component';

@Component({
  selector: 'app-saved-ideas',
  imports: [
    CommonModule,
    NavComponent,
    LoaderComponent
  ],
  templateUrl: './saved-ideas.component.html',
  styleUrl: './saved-ideas.component.css'
})

export class SavedIdeasComponent {

  constructor(public readonly supabaseService: SupabaseService) {};

  isLoading: boolean = false;
  userData: User | null = null;
  ideaData: any[] | null = null;

  async ngOnInit() {
    this.isLoading = true;
    this.userData =  await this.supabaseService.getUser();
    if (this.userData) {
      this.ideaData = await this.supabaseService.fetchIdeas(this.userData.id);
      this.isLoading = false;
    }
  }

}