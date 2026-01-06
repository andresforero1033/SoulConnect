import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppointmentService } from './appointment';

describe('AppointmentService', () => {
    let service: AppointmentService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AppointmentService]
        });

        service = TestBed.inject(AppointmentService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
    });

    it('debería obtener citas por paciente (GET)', () => {
        const patientId = 'abc';
        const mockResponse = [{ id: '1', patientId }];

        service.getByPatient(patientId).subscribe((resp) => {
            expect(resp).toEqual(mockResponse);
        });

        const req = http.expectOne(`http://localhost:8080/api/appointments?patientId=${patientId}`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('debería crear cita (POST)', () => {
        const payload = { patientId: 'abc', specialty: 'Cardio' } as any;
        const mockResponse = { ...payload, id: '1' };

        service.createAppointment(payload).subscribe((resp) => {
            expect(resp).toEqual(mockResponse);
        });

        const req = http.expectOne('http://localhost:8080/api/appointments');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(payload);
        req.flush(mockResponse);
    });

    it('debería eliminar cita (DELETE)', () => {
        const id = '123';

        service.deleteAppointment(id).subscribe((resp) => {
            expect(resp).toBeUndefined();
        });

        const req = http.expectOne(`http://localhost:8080/api/appointments/${id}`);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });
});
