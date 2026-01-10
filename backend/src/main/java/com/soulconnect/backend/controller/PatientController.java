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

    // GET: Traer un paciente por ID
    @GetMapping("/{id}")
    public Patient getPatient(@PathVariable UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado"));
    }

    // GET: Buscar un paciente por documento
    @GetMapping("/search")
    public Patient getByIdentificationNumber(@RequestParam String identificationNumber) {
        return repository.findByIdentificationNumber(identificationNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Paciente no encontrado"));
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
        existing.setEps(payload.getEps());
        existing.setAddress(payload.getAddress());
        existing.setBloodType(payload.getBloodType());
        existing.setHeightCm(payload.getHeightCm());
        existing.setWeightKg(payload.getWeightKg());
        existing.setSexBiological(payload.getSexBiological());
        existing.setGenderIdentity(payload.getGenderIdentity());
        existing.setMaritalStatus(payload.getMaritalStatus());
        existing.setEducationLevel(payload.getEducationLevel());
        existing.setOccupation(payload.getOccupation());
        existing.setEmergencyContactName(payload.getEmergencyContactName());
        existing.setEmergencyContactPhone(payload.getEmergencyContactPhone());
        existing.setCity(payload.getCity());
        existing.setMunicipality(payload.getMunicipality());
        existing.setNeighborhood(payload.getNeighborhood());
        existing.setPostalCode(payload.getPostalCode());
        existing.setHousingType(payload.getHousingType());
        existing.setSocioeconomicStratum(payload.getSocioeconomicStratum());
        existing.setResidenceDurationMonths(payload.getResidenceDurationMonths());
        existing.setAbdominalCircumferenceCm(payload.getAbdominalCircumferenceCm());
        existing.setHeartRateBpm(payload.getHeartRateBpm());
        existing.setRespiratoryRateRpm(payload.getRespiratoryRateRpm());
        existing.setBloodPressureSys(payload.getBloodPressureSys());
        existing.setBloodPressureDia(payload.getBloodPressureDia());
        existing.setTemperatureC(payload.getTemperatureC());
        existing.setSpo2(payload.getSpo2());
        existing.setAllergies(payload.getAllergies());
        existing.setMedications(payload.getMedications());
        existing.setSurgeries(payload.getSurgeries());
        existing.setFamilyHistory(payload.getFamilyHistory());
        existing.setHabits(payload.getHabits());
        existing.setVaccines(payload.getVaccines());
        existing.setChronicConditions(payload.getChronicConditions());

        return repository.save(existing);
        }

    // DELETE: Eliminar un paciente por ID
    @DeleteMapping("/{id}")
    public void deletePatient(@PathVariable UUID id) {
        repository.deleteById(id);
    }
}