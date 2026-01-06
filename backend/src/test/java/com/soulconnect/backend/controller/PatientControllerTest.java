package com.soulconnect.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.soulconnect.backend.model.Patient;
import com.soulconnect.backend.repository.PatientRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class PatientControllerTest {

    private PatientRepository patientRepository;
    private PatientController controller;

    private Patient samplePatient;

    @BeforeEach
    void setUp() {
        patientRepository = Mockito.mock(PatientRepository.class);
        controller = new PatientController(patientRepository);

        samplePatient = new Patient();
        samplePatient.setId(UUID.randomUUID());
        samplePatient.setFirstName("John");
        samplePatient.setLastName("Doe");
        samplePatient.setIdentificationNumber("123");
        samplePatient.setIdentificationType("CC");
        samplePatient.setDateOfBirth(LocalDate.of(1990, 1, 1));
    }

    @Test
    void getAllPatients_returnsList() {
        when(patientRepository.findAll()).thenReturn(List.of(samplePatient));

        List<Patient> result = controller.getAllPatients();

        assertEquals(1, result.size());
        assertEquals("John", result.get(0).getFirstName());
    }

    @Test
    void createPatient_persistsAndReturnsPatient() {
        when(patientRepository.findByIdentificationNumber("123")).thenReturn(Optional.empty());
        when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> {
            Patient p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        Patient created = controller.createPatient(samplePatient);

        verify(patientRepository).save(any(Patient.class));
        assertEquals("John", created.getFirstName());
    }

    @Test
    void createPatient_conflictWhenIdentificationExists() {
        when(patientRepository.findByIdentificationNumber("123")).thenReturn(Optional.of(samplePatient));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.createPatient(samplePatient));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void updatePatient_updatesFields() {
        UUID id = samplePatient.getId();
        when(patientRepository.findById(id)).thenReturn(Optional.of(samplePatient));
        when(patientRepository.findByIdentificationNumber("123")).thenReturn(Optional.of(samplePatient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Patient payload = new Patient();
        payload.setFirstName("Jane");
        payload.setLastName("Smith");
        payload.setIdentificationNumber("123");
        payload.setIdentificationType("CC");
        payload.setDateOfBirth(LocalDate.of(1992, 2, 2));

        Patient updated = controller.updatePatient(id, payload);

        assertEquals("Jane", updated.getFirstName());
        assertEquals("Smith", updated.getLastName());
    }

    @Test
    void updatePatient_conflictWhenIdentificationBelongsToOther() {
        UUID id = samplePatient.getId();
        Patient other = new Patient();
        other.setId(UUID.randomUUID());
        other.setIdentificationNumber("123");

        when(patientRepository.findById(id)).thenReturn(Optional.of(samplePatient));
        when(patientRepository.findByIdentificationNumber("123")).thenReturn(Optional.of(other));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.updatePatient(id, samplePatient));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void deletePatient_deletesAndReturnsOk() {
        UUID id = samplePatient.getId();

        controller.deletePatient(id);

        verify(patientRepository).deleteById(id);
    }
}
