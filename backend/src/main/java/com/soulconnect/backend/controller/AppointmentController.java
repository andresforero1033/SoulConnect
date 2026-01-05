package com.soulconnect.backend.controller;

import com.soulconnect.backend.model.Appointment;
import com.soulconnect.backend.model.AppointmentStatus;
import com.soulconnect.backend.model.Patient;
import com.soulconnect.backend.repository.AppointmentRepository;
import com.soulconnect.backend.repository.PatientRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:4200")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;

    public AppointmentController(AppointmentRepository appointmentRepository, PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
    }

    @GetMapping
    public List<Appointment> getAppointments(@RequestParam(required = false) UUID patientId) {
        if (patientId != null) {
            return appointmentRepository.findByPatientId(patientId);
        }
        return appointmentRepository.findAll();
    }

    @PostMapping
    public Appointment createAppointment(@RequestBody AppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado"));

        Appointment appointment = new Appointment();
        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime());
        appointment.setSpecialty(request.getSpecialty());
        appointment.setStatus(request.getStatus() != null ? request.getStatus() : AppointmentStatus.PENDING);
        appointment.setPatient(patient);

        return appointmentRepository.save(appointment);
    }

    @DeleteMapping("/{id}")
    public void deleteAppointment(@PathVariable UUID id) {
        appointmentRepository.deleteById(id);
    }

    // DTO interno para controlar el payload y evitar exponer Patient en el body
    public static class AppointmentRequest {
        private LocalDate date;
        private LocalTime time;
        private String specialty;
        private AppointmentStatus status;
        private UUID patientId;

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public LocalTime getTime() {
            return time;
        }

        public void setTime(LocalTime time) {
            this.time = time;
        }

        public String getSpecialty() {
            return specialty;
        }

        public void setSpecialty(String specialty) {
            this.specialty = specialty;
        }

        public AppointmentStatus getStatus() {
            return status;
        }

        public void setStatus(AppointmentStatus status) {
            this.status = status;
        }

        public UUID getPatientId() {
            return patientId;
        }

        public void setPatientId(UUID patientId) {
            this.patientId = patientId;
        }
    }
}
