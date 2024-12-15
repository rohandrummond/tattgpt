import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { IdeaFormComponent } from './idea-form/idea-form.component';
import { ResultsComponent } from './results/results.component';

export const routes: Routes = [
    { path: '', component: HomeComponent},
    { path: 'form', component: IdeaFormComponent},
    { path: 'results', component: ResultsComponent}
]; 