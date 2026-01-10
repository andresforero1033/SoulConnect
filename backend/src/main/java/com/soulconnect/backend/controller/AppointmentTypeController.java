package com.soulconnect.backend.controller;

import com.soulconnect.backend.model.AppointmentType;
import com.soulconnect.backend.repository.AppointmentTypeRepository;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/appointment-types")
@CrossOrigin(origins = "http://localhost:4200")
public class AppointmentTypeController {

    private final AppointmentTypeRepository appointmentTypeRepository;

    public AppointmentTypeController(AppointmentTypeRepository appointmentTypeRepository) {
        this.appointmentTypeRepository = appointmentTypeRepository;
    }

    @GetMapping
    public List<AppointmentType> getAll() {
        return appointmentTypeRepository.findAllByOrderByNameAsc();
    }
}
