import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private apiUrl = 'http://localhost:8080/api/appointments';
  private typesUrl = 'http://localhost:8080/api/appointment-types';

  constructor(private http: HttpClient) {}

  getByPatient(patientId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?patientId=${patientId}`);
  }

  getAppointmentTypes(): Observable<any[]> {
    return this.http.get<any[]>(this.typesUrl);
  }

  createAppointment(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateAppointment(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
