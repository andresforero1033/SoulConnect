package com.soulconnect.backend.controller;

import com.soulconnect.backend.model.Patient;
import com.soulconnect.backend.repository.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients") // La dirección web será http://localhost:8080/api/patients
@CrossOrigin(origins = "http://localhost:4200") // Permite que Angular (puerto 4200) nos hable
public class PatientController {

    private final PatientRepository repository;

    public PatientController(PatientRepository repository) {
        this.repository = repository;
    }

    // GET: Traer todos los pacientes
    @GetMapping
    public List<Patient> getAllPatients() {
        return repository.findAll();
    }

    // POST: Guardar un nuevo paciente
    @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        repository.findByIdentificationNumber(patient.getIdentificationNumber())
                .ifPresent(p -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Identificacion ya registrada"); });
        return repository.save(patient);
    }

        @PutMapping("/{id}")
        public Patient updatePatient(@PathVariable UUID id, @RequestBody Patient payload) {
        Patient existing = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado"));

        repository.findByIdentificationNumber(payload.getIdentificationNumber())
            .filter(p -> !p.getId().equals(id))
            .ifPresent(p -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Identificacion ya registrada"); });

        existing.setFirstName(payload.getFirstName());
        existing.setLastName(payload.getLastName());
        existing.setIdentificationNumber(payload.getIdentificationNumber());
        existing.setIdentificationType(payload.getIdentificationType());
        existing.setDateOfBirth(payload.getDateOfBirth());
        existing.setEmail(payload.getEmail());
        existing.setPhoneNumber(payload.getPhoneNumber());

        return repository.save(existing);
        }

    // DELETE: Eliminar un paciente por ID
    @DeleteMapping("/{id}")
    public void deletePatient(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}