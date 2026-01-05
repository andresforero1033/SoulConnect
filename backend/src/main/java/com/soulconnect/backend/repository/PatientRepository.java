package com.soulconnect.backend.repository;

import com.soulconnect.backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

// JpaRepository nos regala métodos como .findAll(), .save(), .delete()
public interface PatientRepository extends JpaRepository<Patient, UUID> {
}