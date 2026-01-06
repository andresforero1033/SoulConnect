import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PatientService } from './patient';

describe('PatientService', () => {
  let service: PatientService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService]
    });
    service = TestBed.inject(PatientService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('debería obtener pacientes (GET)', () => {
    const mockResponse = [{ id: '1', firstName: 'Ana' }];

    service.getPatients().subscribe((resp) => {
      expect(resp).toEqual(mockResponse);
    });

    const req = http.expectOne('http://localhost:8080/api/patients');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('debería crear paciente (POST)', () => {
    const payload = { firstName: 'Ana' } as any;
    const mockResponse = { ...payload, id: '1' };

    service.createPatient(payload).subscribe((resp) => {
      expect(resp).toEqual(mockResponse);
    });

    const req = http.expectOne('http://localhost:8080/api/patients');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('debería actualizar paciente (PUT)', () => {
    const id = 'abc';
    const payload = { firstName: 'Ana' } as any;
    const mockResponse = { ...payload, id };

    service.updatePatient(id, payload).subscribe((resp) => {
      expect(resp).toEqual(mockResponse);
    });

    const req = http.expectOne(`http://localhost:8080/api/patients/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('debería eliminar paciente (DELETE)', () => {
    const id = 'abc';

    service.deletePatient(id).subscribe((resp) => {
      expect(resp).toBeUndefined();
    });

    const req = http.expectOne(`http://localhost:8080/api/patients/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
