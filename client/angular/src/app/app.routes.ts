import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { IdeaFormComponent } from './idea-form/idea-form.component';
import { ResultsComponent } from './results/results.component';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'form', component: IdeaFormComponent},
    { path: 'results', component: ResultsComponent},
    { path: 'auth', component: AuthComponent},
    { path: 'login', component: LoginComponent}
]; 