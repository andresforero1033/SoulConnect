import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
    });

    constructor(private patientService: PatientService, private router: Router) { }

    ngOnInit(): void {
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

        const payload = this.patientForm.value;

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
