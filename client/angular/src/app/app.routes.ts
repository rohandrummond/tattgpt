import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { IdeaFormComponent } from './pages/idea-form/idea-form.component';
import { ResultsComponent } from './pages/results/results.component';
import { SavedIdeasComponent } from './pages/saved-ideas/saved-ideas.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'login', component: LoginComponent},
    { path: 'register', component: RegisterComponent},
    { path: 'form', component: IdeaFormComponent},
    { path: 'results', component: ResultsComponent},
    { path: 'my-ideas', component: SavedIdeasComponent}
]; 