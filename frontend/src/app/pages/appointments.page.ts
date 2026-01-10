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
  filteredPatients: any[] = [];
  selectedPatient: any | null = null;
  appointments: any[] = [];
  appointmentTypes: any[] = [];
  filteredTypes: any[] = [];
  statusOptions = ['PENDING', 'COMPLETED', 'CANCELLED'];
  toasts: { type: 'success' | 'error'; message: string; id: number }[] = [];
  pendingPatientId: string | null = null;
  typeDropdownOpen = false;

  patientLookupControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

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
      if (id) {
        this.loadPatientById(id);
      }
    });

    this.loadPatients();
    this.loadAppointmentTypes();
  }

  loadAppointmentTypes(): void {
    this.appointmentService.getAppointmentTypes().subscribe({
      next: (types: any[]) => {
        this.appointmentTypes = types;
        this.filteredTypes = types;
      },
      error: (err: any) => {
        console.error('Error al cargar tipos de cita:', err);
        this.showToast('error', 'No se pudieron cargar las especialidades');
      }
    });
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (data: any[]) => {
        this.patients = data;
        this.filteredPatients = data;
      },
      error: (err: any) => {
        console.error('Error al cargar pacientes:', err);
        this.showToast('error', 'No se pudieron cargar los pacientes');
      }
    });
  }

  onSearchByDocument(): void {
    if (this.patientLookupControl.invalid) {
      this.patientLookupControl.markAsTouched();
      this.showToast('error', 'Ingresa un documento para buscar');
      return;
    }

    const identificationNumber = `${this.patientLookupControl.value ?? ''}`.trim();
    if (!identificationNumber) {
      this.showToast('error', 'Ingresa un documento para buscar');
      return;
    }

    this.patientService.getPatientByDocument(identificationNumber).subscribe({
      next: patient => {
        this.setSelectedPatient(patient);
      },
      error: (err: any) => {
        console.error('Error al buscar paciente:', err);
        this.clearSelection(false);
        if (err?.status === 404) {
          this.showToast('error', 'Paciente no encontrado');
        } else {
          this.showToast('error', 'No se pudo buscar el paciente');
        }
      }
    });
  }

  onFilterPatients(term: string): void {
    const value = term.toLowerCase().trim();
    if (!value) {
      this.filteredPatients = this.patients;
      return;
    }

    this.filteredPatients = this.patients.filter(p => {
      const fullName = `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase();
      const idNumber = `${p.identificationNumber ?? ''}`.toLowerCase();
      return fullName.includes(value) || idNumber.includes(value);
    });

    const exact = this.filteredPatients.find(p => `${p.identificationNumber ?? ''}`.toLowerCase() === value);
    if (exact) {
      this.setSelectedPatient(exact);
    }
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

  loadPatientById(patientId: string): void {
    this.patientService.getPatient(patientId).subscribe({
      next: patient => {
        this.setSelectedPatient(patient, false);
        if (patient?.identificationNumber) {
          this.patientLookupControl.setValue(patient.identificationNumber, { emitEvent: false });
        }
      },
      error: (err: any) => {
        console.error('Error al cargar paciente:', err);
        this.clearSelection(false);
        this.showToast('error', 'No se pudo cargar el paciente');
      }
    });
  }

  setSelectedPatient(patient: any, updateQueryParams: boolean = true): void {
    this.selectedPatient = patient;
    this.appointmentForm.reset({ status: 'PENDING' });
    this.loadAppointments(patient.id);
    if (updateQueryParams) {
      this.router.navigate([], {
        queryParams: { patientId: patient.id },
        queryParamsHandling: 'merge'
      });
    }
  }

  clearSelection(navigate: boolean = true): void {
    this.selectedPatient = null;
    this.appointments = [];
    this.appointmentForm.reset({ status: 'PENDING' });
    this.patientLookupControl.reset();
    if (navigate) {
      this.router.navigate([], { queryParams: { patientId: null }, queryParamsHandling: 'merge' });
    }
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
