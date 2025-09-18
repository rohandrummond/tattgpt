import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../components/nav/nav.component';

@Component({
  selector: 'app-info',
  imports: [CommonModule, NavComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
})
export class InfoComponent {}
