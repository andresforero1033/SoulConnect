import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:8080/api/patients';

  constructor(private http: HttpClient) { }

  // Obtener todos los pacientes
  getPatients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Guardar un nuevo paciente
  createPatient(patient: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, patient);
  }

  // Actualizar un paciente
  updatePatient(id: string, patient: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, patient);
  }

  // Eliminar un paciente por id
  deletePatient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}