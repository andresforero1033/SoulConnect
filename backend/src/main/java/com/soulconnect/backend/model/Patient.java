package com.soulconnect.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "patients") // Esto creará la tabla 'patients' en PostgreSQL
@Data // Lombok: Crea automáticamente los Getters, Setters y Constructores (¡Magia!)
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id; // Usamos UUID para que los IDs sean seguros (ej. a0eebc99...)

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "identification_number", nullable = false, unique = true, length = 20)
    private String identificationNumber; // Cédula

    @Column(name = "identification_type", nullable = false, length = 10)
    private String identificationType; // CC, TI, CE

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phoneNumber;

    @Column(name = "eps")
    private String eps;

    @Column(name = "address")
    private String address;

    @Column(name = "blood_type")
    private String bloodType;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "sex_biological")
    private String sexBiological;

    @Column(name = "gender_identity")
    private String genderIdentity;

    @Column(name = "marital_status")
    private String maritalStatus;

    @Column(name = "education_level")
    private String educationLevel;

    @Column(name = "occupation")
    private String occupation;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "city")
    private String city;

    @Column(name = "municipality")
    private String municipality;

    @Column(name = "neighborhood")
    private String neighborhood;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "housing_type")
    private String housingType;

    @Column(name = "socioeconomic_stratum")
    private String socioeconomicStratum;

    @Column(name = "residence_duration_months")
    private Integer residenceDurationMonths;

    @Column(name = "abdominal_circumference_cm")
    private Double abdominalCircumferenceCm;

    @Column(name = "heart_rate_bpm")
    private Integer heartRateBpm;

    @Column(name = "respiratory_rate_rpm")
    private Integer respiratoryRateRpm;

    @Column(name = "blood_pressure_sys")
    private Integer bloodPressureSys;

    @Column(name = "blood_pressure_dia")
    private Integer bloodPressureDia;

    @Column(name = "temperature_c")
    private Double temperatureC;

    @Column(name = "spo2")
    private Double spo2;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "medications", columnDefinition = "TEXT")
    private String medications;

    @Column(name = "surgeries", columnDefinition = "TEXT")
    private String surgeries;

    @Column(name = "family_history", columnDefinition = "TEXT")
    private String familyHistory;

    @Column(name = "habits", columnDefinition = "TEXT")
    private String habits;

    @Column(name = "vaccines", columnDefinition = "TEXT")
    private String vaccines;

    @Column(name = "chronic_conditions", columnDefinition = "TEXT")
    private String chronicConditions;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist // Antes de guardar, asigna la fecha actual automáticamente
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}