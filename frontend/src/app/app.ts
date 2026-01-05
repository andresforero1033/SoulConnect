import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms'; 
import { PatientService } from './services/patient';

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
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule], 
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent implements OnInit {
  title = 'SoulConnect';
  patients: any[] = [];
  filtered: any[] = [];
  page = 1;
  pageSize = 5;
  toasts: { type: 'success' | 'error'; message: string; id: number }[] = [];

  patientForm = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    lastName: new FormControl('', [Validators.required]),
    identificationNumber: new FormControl('', [Validators.required]),
    identificationType: new FormControl('CC', [Validators.required]),
    dateOfBirth: new FormControl('', [Validators.required, notFutureDate]),
    email: new FormControl('', [Validators.email]),
    phoneNumber: new FormControl('', [])
  });

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.patientService.getPatients().subscribe({
      next: (data: any[]) => {
        this.patients = data;
        this.filtered = data;
        this.page = 1;
      },
      error: (err: any) => {
        console.error('Error al cargar:', err);
        this.showToast('error', 'Error al cargar pacientes');
      }
    });
  }

  onSubmit() {
    if (this.patientForm.valid) {
      this.patientService.createPatient(this.patientForm.value).subscribe({
        next: (response: any) => {
          this.loadPatients(); // Refresca la lista
          this.patientForm.reset({ identificationType: 'CC' }); // Limpia el formulario y deja CC por defecto
          this.page = 1;
          this.showToast('success', 'Paciente guardado');
          window.alert('Paciente guardado con exito');
        },
        error: (err: any) => {
          console.error('Error al guardar:', err);
          if (err?.status === 409) {
            this.showToast('error', 'Identificacion ya registrada');
          } else {
            this.showToast('error', 'No se pudo guardar');
          }
        }
      });
    }
  }

  onDelete(id: string) {
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
      }
    });
  }

  onSearch(term: string) {
    const value = term.toLowerCase().trim();
    if (!value) {
      this.filtered = this.patients;
      this.page = 1;
      return;
    }

    this.filtered = this.patients.filter(p => {
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

  goToPage(page: number) {
    const target = Math.min(Math.max(1, page), this.totalPages);
    this.page = target;
  }

  showToast(type: 'success' | 'error', message: string) {
    const id = Date.now() + Math.random();
    this.toasts.push({ type, message, id });
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 2500);
  }

  isInvalid(field: string): boolean {
    const control = this.patientForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}