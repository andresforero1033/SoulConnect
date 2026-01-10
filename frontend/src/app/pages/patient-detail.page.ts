import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../services/patient';
import { AppointmentService } from '../services/appointment';

@Component({
  selector: 'app-patient-detail-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-detail.page.html',
  styleUrls: ['../app.scss']
})
export class PatientDetailPageComponent implements OnInit {
  patient: any | null = null;
  appointments: any[] = [];
  pendingAppointments: any[] = [];
  pastAppointments: any[] = [];
  appointmentTypes: any[] = [];
  filteredTypes: any[] = [];
  typeDropdownOpen = false;
  editingAppointmentId: string | null = null;
  statusOptions = ['PENDING', 'COMPLETED', 'CANCELLED'];
  toasts: { type: 'success' | 'error'; message: string; id: number }[] = [];

  patientForm = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    lastName: new FormControl('', [Validators.required]),
    identificationNumber: new FormControl('', [Validators.required]),
    identificationType: new FormControl('CC', [Validators.required]),
    dateOfBirth: new FormControl('', [Validators.required]),
    email: new FormControl('', []),
    phoneNumber: new FormControl('', []),
    eps: new FormControl('', []),
    address: new FormControl('', []),
    bloodType: new FormControl('', []),
    heightCm: new FormControl('', []),
    weightKg: new FormControl('', [])
  });

  appointmentForm = new FormGroup({
    date: new FormControl('', [Validators.required]),
    time: new FormControl('', [Validators.required]),
    specialty: new FormControl('', [Validators.required, Validators.minLength(2)]),
    status: new FormControl('PENDING', [Validators.required])
  });

  get bmi(): number | null {
    const h = Number(this.patientForm.get('heightCm')?.value) / 100;
    const w = Number(this.patientForm.get('weightKg')?.value);
    if (!h || !w) {
      return null;
    }
    return +(w / (h * h)).toFixed(2);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.showToast('error', 'Paciente no encontrado');
      this.router.navigate(['/pacientes']);
      return;
    }

    this.loadPatient(id);
    this.loadAppointments(id);
    this.loadAppointmentTypes();
  }

  loadPatient(id: string): void {
    this.patientService.getPatient(id).subscribe({
      next: patient => {
        this.patient = patient;
        this.patientForm.patchValue({
          firstName: patient.firstName,
          lastName: patient.lastName,
          identificationNumber: patient.identificationNumber,
          identificationType: patient.identificationType,
          dateOfBirth: patient.dateOfBirth,
          email: patient.email,
          phoneNumber: patient.phoneNumber,
          eps: patient.eps,
          address: patient.address,
          bloodType: patient.bloodType,
          heightCm: patient.heightCm,
          weightKg: patient.weightKg
        });
      },
      error: err => {
        console.error('Error al cargar paciente:', err);
        this.showToast('error', 'No se pudo cargar el paciente');
        this.router.navigate(['/pacientes']);
      }
    });
  }

  loadAppointments(patientId: string): void {
    this.appointmentService.getByPatient(patientId).subscribe({
      next: data => {
        this.appointments = data;
        this.splitAppointments();
      },
      error: err => {
        console.error('Error al cargar citas:', err);
        this.showToast('error', 'No se pudieron cargar las citas');
      }
    });
  }

  private splitAppointments(): void {
    const today = new Date();
    this.pendingAppointments = [];
    this.pastAppointments = [];

    this.appointments.forEach(a => {
      const dateTime = new Date(`${a.date}T${a.time}`);
      if (dateTime >= today && a.status !== 'CANCELLED') {
        this.pendingAppointments.push(a);
      } else {
        this.pastAppointments.push(a);
      }
    });
  }

  loadAppointmentTypes(): void {
    this.appointmentService.getAppointmentTypes().subscribe({
      next: types => {
        this.appointmentTypes = types;
        this.filteredTypes = types;
      },
      error: err => {
        console.error('Error al cargar tipos de cita:', err);
        this.showToast('error', 'No se pudieron cargar las especialidades');
      }
    });
  }

  savePatient(): void {
    if (!this.patient || this.patientForm.invalid) {
      this.patientForm.markAllAsTouched();
      return;
    }

    this.patientService.updatePatient(this.patient.id, this.patientForm.value).subscribe({
      next: () => {
        this.showToast('success', 'Paciente actualizado');
        this.loadPatient(this.patient!.id);
      },
      error: err => {
        console.error('Error al actualizar paciente:', err);
        this.showToast('error', 'No se pudo actualizar el paciente');
      }
    });
  }

  onSpecialtyInput(term: string): void {
    const value = term.toLowerCase().trim();
    this.typeDropdownOpen = true;
    if (!value) {
      this.filteredTypes = this.appointmentTypes;
      return;
    }
    this.filteredTypes = this.appointmentTypes.filter(t => {
      const haystack = `${t.name ?? ''} ${t.specialty ?? ''} ${t.code ?? ''}`.toLowerCase();
      return haystack.includes(value);
    });
  }

  onSelectType(type: any): void {
    const value = type?.name ?? type?.specialty ?? '';
    this.appointmentForm.patchValue({ specialty: value });
    this.typeDropdownOpen = false;
  }

  closeTypeDropdown(): void {
    setTimeout(() => (this.typeDropdownOpen = false), 120);
  }

  startEditAppointment(appointment: any): void {
    this.editingAppointmentId = appointment.id;
    this.appointmentForm.patchValue({
      date: appointment.date,
      time: appointment.time,
      specialty: appointment.specialty,
      status: appointment.status
    });
  }

  cancelAppointmentEdit(): void {
    this.editingAppointmentId = null;
    this.appointmentForm.reset({ status: 'PENDING' });
  }

  saveAppointment(): void {
    if (!this.patient) {
      this.showToast('error', 'Selecciona un paciente');
      return;
    }
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.appointmentForm.value,
      patientId: this.patient.id
    };

    const action = this.editingAppointmentId
      ? this.appointmentService.updateAppointment(this.editingAppointmentId, payload)
      : this.appointmentService.createAppointment(payload);

    action.subscribe({
      next: () => {
        this.showToast('success', this.editingAppointmentId ? 'Cita actualizada' : 'Cita creada');
        this.cancelAppointmentEdit();
        this.loadAppointments(this.patient!.id);
      },
      error: err => {
        console.error('Error al guardar cita:', err);
        this.showToast('error', 'No se pudo guardar la cita');
      }
    });
  }

  deleteAppointment(id: string): void {
    const confirmed = window.confirm('¿Eliminar esta cita?');
    if (!confirmed) {
      return;
    }

    this.appointmentService.deleteAppointment(id).subscribe({
      next: () => {
        this.showToast('success', 'Cita eliminada');
        if (this.patient) {
          this.loadAppointments(this.patient.id);
        }
      },
      error: err => {
        console.error('Error al eliminar cita:', err);
        this.showToast('error', 'No se pudo eliminar');
      }
    });
  }

  goBack(): void {
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
