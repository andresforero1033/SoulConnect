package com.soulconnect.backend.controller;

import com.soulconnect.backend.model.Patient;
import com.soulconnect.backend.repository.PatientRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
        return repository.save(patient);
    }
}