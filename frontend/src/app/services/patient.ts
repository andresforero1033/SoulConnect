import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  // Esta es la URL de tu Backend (Java)
  private apiUrl = 'http://localhost:8080/api/patients';

  constructor(private http: HttpClient) { }

  // Método para pedir la lista de pacientes
  getPatients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}