package com.soulconnect.backend.repository;

import com.soulconnect.backend.model.Appointment;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    List<Appointment> findByPatientId(UUID patientId);
}
