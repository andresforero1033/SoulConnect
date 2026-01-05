import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from './services/patient'; // Asegúrate que esta ruta no tenga error
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './app.html', // <--- Apunta a tu archivo app.html
  styleUrls: ['./app.scss']   // <--- Apunta a tu archivo app.scss
})
export class AppComponent implements OnInit {
  title = 'SoulConnect';
  patients: any[] = [];

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.patientService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        console.log('Pacientes cargados:', data);
      },
      error: (error) => {
        console.error('Error conectando con el backend:', error);
      }
    });
  }
}