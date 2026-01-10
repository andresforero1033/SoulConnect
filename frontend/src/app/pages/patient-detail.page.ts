import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  locations: { city: string; department: string }[] = [];
  filteredLocations: { city: string; department: string }[] = [];
  locationDropdownOpen = false;
  epsList: string[] = [
    'Nueva EPS',
    'EPS Sura',
    'Sanitas',
    'Salud Total',
    'Compensar',
    'Famisanar',
    'Coosalud',
    'Mutual Ser',
    'Aliansalud',
    'Savia Salud',
    'Emssanar',
    'Capital Salud',
    'Ecoopsos',
    'Cajacopi',
    'Asmet Salud',
    'SOS EPS',
    'EPS Familiar de Colombia',
    'Dusakawi EPSI',
    'Mallamas EPSI',
    'AIC EPSI'
  ];
  filteredEps: string[] = [];
  epsDropdownOpen = false;
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
    weightKg: new FormControl('', []),
    location: new FormControl('', []),
    sexBiological: new FormControl('', []),
    genderIdentity: new FormControl('', []),
    maritalStatus: new FormControl('', []),
    educationLevel: new FormControl('', []),
    occupation: new FormControl('', []),
    emergencyContactName: new FormControl('', []),
    emergencyContactPhone: new FormControl('', []),
    city: new FormControl('', []),
    municipality: new FormControl('', []),
    neighborhood: new FormControl('', []),
    postalCode: new FormControl('', []),
    housingType: new FormControl('', []),
    socioeconomicStratum: new FormControl('', []),
    residenceDurationMonths: new FormControl('', []),
    abdominalCircumferenceCm: new FormControl('', []),
    heartRateBpm: new FormControl('', []),
    respiratoryRateRpm: new FormControl('', []),
    bloodPressureSys: new FormControl('', []),
    bloodPressureDia: new FormControl('', []),
    temperatureC: new FormControl('', []),
    spo2: new FormControl('', []),
    allergies: new FormControl('', []),
    medications: new FormControl('', []),
    surgeries: new FormControl('', []),
    familyHistory: new FormControl('', []),
    habits: new FormControl('', []),
    vaccines: new FormControl('', []),
    chronicConditions: new FormControl('', [])
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
    private appointmentService: AppointmentService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.filteredEps = this.epsList;
    this.loadLocations();
    this.loadAppointmentTypes();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (!id) {
        this.showToast('error', 'Paciente no encontrado');
        this.router.navigate(['/pacientes']);
        return;
      }

      this.loadPatient(id);
    });
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
          weightKg: patient.weightKg,
          location: this.composeLocation(patient.city, patient.municipality),
          sexBiological: patient.sexBiological,
          genderIdentity: patient.genderIdentity,
          maritalStatus: patient.maritalStatus,
          educationLevel: patient.educationLevel,
          occupation: patient.occupation,
          emergencyContactName: patient.emergencyContactName,
          emergencyContactPhone: patient.emergencyContactPhone,
          city: patient.city,
          municipality: patient.municipality,
          neighborhood: patient.neighborhood,
          postalCode: patient.postalCode,
          housingType: patient.housingType,
          socioeconomicStratum: patient.socioeconomicStratum,
          residenceDurationMonths: patient.residenceDurationMonths,
          abdominalCircumferenceCm: patient.abdominalCircumferenceCm,
          heartRateBpm: patient.heartRateBpm,
          respiratoryRateRpm: patient.respiratoryRateRpm,
          bloodPressureSys: patient.bloodPressureSys,
          bloodPressureDia: patient.bloodPressureDia,
          temperatureC: patient.temperatureC,
          spo2: patient.spo2,
          allergies: patient.allergies,
          medications: patient.medications,
          surgeries: patient.surgeries,
          familyHistory: patient.familyHistory,
          habits: patient.habits,
          vaccines: patient.vaccines,
          chronicConditions: patient.chronicConditions
        });

        // Load appointments after patient data is confirmed to ensure the id is valid
        this.loadAppointments(patient.id);
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

  loadLocations(): void {
    this.http.get<any[]>('assets/colombia-locations.json').subscribe({
      next: data => {
        this.locations = data.flatMap(d => d.ciudades.map((city: string) => ({ city, department: d.departamento })));
        this.filteredLocations = this.locations;
        const currentLocation = this.patientForm.get('location')?.value;
        if (currentLocation) {
          this.filteredLocations = this.locations;
        }
      },
      error: err => {
        console.error('Error al cargar ciudades:', err);
      }
    });
  }

  onLocationInput(term: string): void {
    const value = term.toLowerCase().trim();
    this.locationDropdownOpen = true;
    if (!value) {
      this.filteredLocations = this.locations;
      return;
    }
    this.filteredLocations = this.locations.filter(loc => {
      const haystack = `${loc.city} ${loc.department}`.toLowerCase();
      return haystack.includes(value);
    });
  }

  onSelectLocation(loc: { city: string; department: string }): void {
    this.patientForm.patchValue({
      city: loc.city,
      municipality: loc.department,
      location: `${loc.city}, ${loc.department}`
    });
    this.locationDropdownOpen = false;
  }

  closeLocationDropdown(): void {
    setTimeout(() => (this.locationDropdownOpen = false), 120);
  }

  onEpsInput(term: string): void {
    const value = term.toLowerCase().trim();
    this.epsDropdownOpen = true;
    if (!value) {
      this.filteredEps = this.epsList;
      return;
    }
    this.filteredEps = this.epsList.filter(eps => eps.toLowerCase().includes(value));
  }

  onSelectEps(eps: string): void {
    this.patientForm.patchValue({ eps });
    this.epsDropdownOpen = false;
  }

  closeEpsDropdown(): void {
    setTimeout(() => (this.epsDropdownOpen = false), 120);
  }

  private composeLocation(city?: string, department?: string): string {
    if (!city && !department) return '';
    if (city && department) return `${city}, ${department}`;
    return city ?? department ?? '';
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

    const { location, ...payload } = this.patientForm.value;

    this.patientService.updatePatient(this.patient.id, payload).subscribe({
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
