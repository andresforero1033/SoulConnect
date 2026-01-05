import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../services/appointment';
import { PatientService } from '../services/patient';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './appointments.page.html',
  styleUrls: ['../app.scss']
})
export class AppointmentsPageComponent implements OnInit {
  patients: any[] = [];
  selectedPatient: any | null = null;
  appointments: any[] = [];
  statusOptions = ['PENDING', 'COMPLETED', 'CANCELLED'];
  toasts: { type: 'success' | 'error'; message: string; id: number }[] = [];
  pendingPatientId: string | null = null;

  appointmentForm = new FormGroup({
    date: new FormControl('', [Validators.required]),
    time: new FormControl('', [Validators.required]),
    specialty: new FormControl('', [Validators.required, Validators.minLength(2)]),
    status: new FormControl('PENDING', [Validators.required])
  });

  constructor(
    private patientService: PatientService,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('patientId');
      this.pendingPatientId = id;
      if (id && this.patients.length) {
        this.selectPatientFromList(id);
      }
    });

    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (data: any[]) => {
        this.patients = data;
        if (this.pendingPatientId) {
          this.selectPatientFromList(this.pendingPatientId);
        }
      },
      error: (err: any) => {
        console.error('Error al cargar pacientes:', err);
        this.showToast('error', 'No se pudieron cargar los pacientes');
      }
    });
  }

  selectPatientFromList(patientId: string): void {
    if (!patientId) {
      this.selectedPatient = null;
      this.appointments = [];
      this.router.navigate([], { queryParams: { patientId: null }, queryParamsHandling: 'merge' });
      return;
    }

    const patient = this.patients.find(p => p.id === patientId);
    if (!patient) {
      this.showToast('error', 'Paciente no encontrado');
      return;
    }
    this.onSelectPatient(patient);
  }

  onSelectPatient(patient: any): void {
    this.selectedPatient = patient;
    this.appointmentForm.reset({ status: 'PENDING' });
    this.loadAppointments(patient.id);
    this.router.navigate([], {
      queryParams: { patientId: patient.id },
      queryParamsHandling: 'merge'
    });
  }

  loadAppointments(patientId: string): void {
    this.appointmentService.getByPatient(patientId).subscribe({
      next: (data: any[]) => {
        this.appointments = data;
      },
      error: (err: any) => {
        console.error('Error al cargar citas:', err);
        this.showToast('error', 'No se pudieron cargar las citas');
      }
    });
  }

  onCreateAppointment(): void {
    if (!this.selectedPatient) {
      this.showToast('error', 'Selecciona un paciente');
      return;
    }

    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.appointmentForm.value,
      patientId: this.selectedPatient.id
    };

    this.appointmentService.createAppointment(payload).subscribe({
      next: () => {
        this.showToast('success', 'Cita creada');
        this.appointmentForm.reset({ status: 'PENDING' });
        this.loadAppointments(this.selectedPatient!.id);
      },
      error: (err: any) => {
        console.error('Error al crear cita:', err);
        this.showToast('error', 'No se pudo crear la cita');
      }
    });
  }

  onDeleteAppointment(id: string): void {
    const confirmed = window.confirm('¿Eliminar esta cita?');
    if (!confirmed) {
      return;
    }

    this.appointmentService.deleteAppointment(id).subscribe({
      next: () => {
        if (this.selectedPatient) {
          this.loadAppointments(this.selectedPatient.id);
        }
        this.showToast('success', 'Cita eliminada');
      },
      error: (err: any) => {
        console.error('Error al eliminar cita:', err);
        this.showToast('error', 'No se pudo eliminar la cita');
      }
    });
  }

  goToPatients(): void {
    this.router.navigate(['/pacientes']);
  }

  showToast(type: 'success' | 'error', message: string): void {
    const id = Date.now() + Math.random();
    this.toasts.push({ type, message, id });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 2500);
  }
}
