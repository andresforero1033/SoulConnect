package com.soulconnect.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.soulconnect.backend.model.Appointment;
import com.soulconnect.backend.model.AppointmentStatus;
import com.soulconnect.backend.model.Patient;
import com.soulconnect.backend.repository.AppointmentRepository;
import com.soulconnect.backend.repository.PatientRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class AppointmentControllerTest {

    private AppointmentRepository appointmentRepository;
    private PatientRepository patientRepository;
    private AppointmentController controller;

    private Patient patient;
    private Appointment appointment;

    @BeforeEach
    void setUp() {
        appointmentRepository = Mockito.mock(AppointmentRepository.class);
        patientRepository = Mockito.mock(PatientRepository.class);
        controller = new AppointmentController(appointmentRepository, patientRepository);

        patient = new Patient();
        patient.setId(UUID.randomUUID());
        patient.setFirstName("John");
        patient.setLastName("Doe");
        patient.setIdentificationNumber("123");
        patient.setIdentificationType("CC");
        patient.setDateOfBirth(LocalDate.of(1990, 1, 1));

        appointment = new Appointment();
        appointment.setId(UUID.randomUUID());
        appointment.setDate(LocalDate.of(2026, 1, 5));
        appointment.setTime(LocalTime.of(10, 30));
        appointment.setSpecialty("Cardiologia");
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setPatient(patient);
    }

    @Test
    void getAppointments_byPatient() {
        when(appointmentRepository.findByPatientId(patient.getId())).thenReturn(List.of(appointment));

        List<Appointment> result = controller.getAppointments(patient.getId());

        assertEquals(1, result.size());
        assertEquals("Cardiologia", result.get(0).getSpecialty());
    }

    @Test
    void getAppointments_all() {
        when(appointmentRepository.findAll()).thenReturn(List.of(appointment));

        List<Appointment> result = controller.getAppointments(null);

        assertEquals(1, result.size());
        assertEquals(AppointmentStatus.PENDING, result.get(0).getStatus());
    }

    @Test
    void createAppointment_persistsAndReturns() {
        when(patientRepository.findById(patient.getId())).thenReturn(Optional.of(patient));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment appt = invocation.getArgument(0);
            appt.setId(UUID.randomUUID());
            return appt;
        });

        AppointmentController.AppointmentRequest request = new AppointmentController.AppointmentRequest();
        request.setDate(appointment.getDate());
        request.setTime(appointment.getTime());
        request.setSpecialty(appointment.getSpecialty());
        request.setStatus(AppointmentStatus.PENDING);
        request.setPatientId(patient.getId());

        Appointment created = controller.createAppointment(request);

        verify(appointmentRepository).save(any(Appointment.class));
        assertEquals("Cardiologia", created.getSpecialty());
        assertEquals(patient.getId(), created.getPatient().getId());
    }

    @Test
    void createAppointment_notFoundWhenPatientMissing() {
        when(patientRepository.findById(patient.getId())).thenReturn(Optional.empty());

        AppointmentController.AppointmentRequest request = new AppointmentController.AppointmentRequest();
        request.setDate(appointment.getDate());
        request.setTime(appointment.getTime());
        request.setSpecialty(appointment.getSpecialty());
        request.setStatus(AppointmentStatus.PENDING);
        request.setPatientId(patient.getId());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> controller.createAppointment(request));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void deleteAppointment_deletesAndReturnsOk() {
        UUID id = appointment.getId();

        controller.deleteAppointment(id);

        verify(appointmentRepository).deleteById(id);
    }
}
