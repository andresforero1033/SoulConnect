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