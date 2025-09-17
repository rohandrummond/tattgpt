import { Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { IdeaFormComponent } from './pages/idea-form/idea-form.component';
import { ResultsComponent } from './pages/results/results.component';
import { SavedIdeasComponent } from './pages/saved-ideas/saved-ideas.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'login', component: LoginComponent},
    { path: 'register', component: RegisterComponent},
    { path: 'form', component: IdeaFormComponent},
    { path: 'results', component: ResultsComponent},
    { path: 'my-ideas', component: SavedIdeasComponent, canActivate: [AuthGuardService] },
    { path: 'unauthorized', component: UnauthorizedComponent},
    { path: '**', component: NotFoundComponent}
]; 