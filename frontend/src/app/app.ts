import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  navItems = [
    { path: '/pacientes', icon: 'groups', label: 'Pacientes' },
    { path: '/citas', icon: 'event_note', label: 'Citas' },
    { path: '/indicadores', icon: 'analytics', label: 'Indicadores' }
  ];
}