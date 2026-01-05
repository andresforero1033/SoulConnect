import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = 'http://localhost:8080/api/appointments';

  constructor(private http: HttpClient) {}

  getByPatient(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?patientId=${patientId}`);
  }

  createAppointment(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
