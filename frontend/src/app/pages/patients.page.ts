import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
    FormControl,
    FormGroup,
    Validators,
    AbstractControl,
    ValidationErrors,
    ReactiveFormsModule,
} from '@angular/forms';
import { PatientService } from '../services/patient';

function notFutureDate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
        return null;
    }
    const inputDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate > today ? { futureDate: true } : null;
}

@Component({
    selector: 'app-patients-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './patients.page.html',
    styleUrls: ['../app.scss'],
})
export class PatientsPageComponent implements OnInit {
    patients: any[] = [];
    filtered: any[] = [];
    page = 1;
    pageSize = 4;
    toasts: { type: 'success' | 'error'; message: string; id: number }[] = [];
    editingId: string | null = null;

    patientForm = new FormGroup({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
        lastName: new FormControl('', [Validators.required]),
        identificationNumber: new FormControl('', [Validators.required]),
        identificationType: new FormControl('CC', [Validators.required]),
        dateOfBirth: new FormControl('', [Validators.required, notFutureDate]),
        email: new FormControl('', [Validators.email]),
        phoneNumber: new FormControl('', []),
        eps: new FormControl('', []),
        address: new FormControl('', []),
        bloodType: new FormControl('', []),
        heightCm: new FormControl('', []),
        weightKg: new FormControl('', []),
        location: new FormControl('', []),
        city: new FormControl('', []),
        municipality: new FormControl('', []),
        housingType: new FormControl('', []),
        socioeconomicStratum: new FormControl('', []),
        residenceDurationMonths: new FormControl('', []),
        allergies: new FormControl('', []),
        medications: new FormControl('', []),
        surgeries: new FormControl('', []),
        familyHistory: new FormControl('', []),
        habits: new FormControl('', []),
        vaccines: new FormControl('', []),
        chronicConditions: new FormControl('', []),
    });

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
        'AIC EPSI',
    ];
    filteredEps: string[] = [];
    epsDropdownOpen = false;

    constructor(private patientService: PatientService, private router: Router, private http: HttpClient) { }

    ngOnInit(): void {
        this.filteredEps = this.epsList;
        this.loadLocations();
        this.loadPatients();
    }

    loadPatients(): void {
        this.patientService.getPatients().subscribe({
            next: (data: any[]) => {
                this.patients = data;
                this.filtered = data;
                this.page = 1;
            },
            error: (err: any) => {
                console.error('Error al cargar:', err);
                this.showToast('error', 'Error al cargar pacientes');
            },
        });
    }

    onSubmit(): void {
        if (this.patientForm.invalid) {
            this.patientForm.markAllAsTouched();
            return;
        }

        const { location, ...payload } = this.patientForm.value;

        if (this.editingId) {
            this.patientService.updatePatient(this.editingId, payload).subscribe({
                next: () => {
                    this.loadPatients();
                    this.resetForm();
                    this.showToast('success', 'Paciente actualizado');
                },
                error: (err: any) => {
                    console.error('Error al actualizar:', err);
                    if (err?.status === 409) {
                        this.showToast('error', 'Identificacion ya registrada');
                    } else {
                        this.showToast('error', 'No se pudo actualizar');
                    }
                },
            });
        } else {
            this.patientService.createPatient(payload).subscribe({
                next: () => {
                    this.loadPatients();
                    this.resetForm();
                    this.page = 1;
                    this.showToast('success', 'Paciente guardado');
                },
                error: (err: any) => {
                    console.error('Error al guardar:', err);
                    if (err?.status === 409) {
                        this.showToast('error', 'Identificacion ya registrada');
                    } else {
                        this.showToast('error', 'No se pudo guardar');
                    }
                },
            });
        }
    }

    startEdit(patient: any): void {
        this.editingId = patient.id;
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
            city: patient.city,
            municipality: patient.municipality,
            housingType: patient.housingType,
            socioeconomicStratum: patient.socioeconomicStratum,
            residenceDurationMonths: patient.residenceDurationMonths,
            allergies: patient.allergies,
            medications: patient.medications,
            surgeries: patient.surgeries,
            familyHistory: patient.familyHistory,
            habits: patient.habits,
            vaccines: patient.vaccines,
            chronicConditions: patient.chronicConditions,
        });
    }

    cancelEdit(): void {
        this.resetForm();
    }

    private resetForm(): void {
        this.editingId = null;
        this.patientForm.reset({ identificationType: 'CC' });
    }

    onDelete(id: string): void {
        const confirmed = window.confirm('¿Eliminar este paciente?');
        if (!confirmed) {
            return;
        }

        this.patientService.deletePatient(id).subscribe({
            next: () => {
                this.loadPatients();
                this.showToast('success', 'Paciente eliminado');
            },
            error: (err: any) => {
                console.error('Error al eliminar:', err);
                this.showToast('error', 'No se pudo eliminar');
            },
        });
    }

    onSearch(term: string): void {
        const value = term.toLowerCase().trim();
        if (!value) {
            this.filtered = this.patients;
            this.page = 1;
            return;
        }

        this.filtered = this.patients.filter((p) => {
            const fullName = `${p.firstName ?? ''} ${p.lastName ?? ''}`.toLowerCase();
            const idNumber = `${p.identificationNumber ?? ''}`.toLowerCase();
            return fullName.includes(value) || idNumber.includes(value);
        });
        this.page = 1;
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.filtered.length / this.pageSize) || 1);
    }

    get paged(): any[] {
        const start = (this.page - 1) * this.pageSize;
        return this.filtered.slice(start, start + this.pageSize);
    }

    goToPage(page: number): void {
        const target = Math.min(Math.max(1, page), this.totalPages);
        this.page = target;
    }

    navigateToAppointments(patient: any): void {
        this.router.navigate(['/citas'], { queryParams: { patientId: patient.id } });
    }

    navigateToPatientDetail(patient: any): void {
        this.router.navigate(['/pacientes', patient.id]);
    }

    loadLocations(): void {
        this.http.get<any[]>('assets/colombia-locations.json').subscribe({
            next: (data: any[]) => {
                this.locations = data.flatMap((d: any) => d.ciudades.map((city: string) => ({ city, department: d.departamento })));
                this.filteredLocations = this.locations;
            },
            error: (err: any) => console.error('Error al cargar ciudades:', err),
        });
    }

    onLocationInput(term: string): void {
        const value = term.toLowerCase().trim();
        this.locationDropdownOpen = true;
        if (!value) {
            this.filteredLocations = this.locations;
            return;
        }
        this.filteredLocations = this.locations.filter((loc) => `${loc.city} ${loc.department}`.toLowerCase().includes(value));
    }

    onSelectLocation(loc: { city: string; department: string }): void {
        this.patientForm.patchValue({
            city: loc.city,
            municipality: loc.department,
            location: `${loc.city}, ${loc.department}`,
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
        this.filteredEps = this.epsList.filter((eps) => eps.toLowerCase().includes(value));
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

    showToast(type: 'success' | 'error', message: string): void {
        const id = Date.now() + Math.random();
        this.toasts.push({ type, message, id });
        setTimeout(() => {
            this.toasts = this.toasts.filter((t) => t.id !== id);
        }, 2500);
    }

    isInvalid(field: string): boolean {
        const control = this.patientForm.get(field);
        return !!control && control.invalid && (control.dirty || control.touched);
    }
}
