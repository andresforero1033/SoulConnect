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

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 20)
    private String identificationNumber; // Cédula

    @Column(nullable = false)
    private String identificationType; // CC, TI, CE

    private LocalDate dateOfBirth;

    private String email;

    private String phoneNumber;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist // Antes de guardar, asigna la fecha actual automáticamente
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}