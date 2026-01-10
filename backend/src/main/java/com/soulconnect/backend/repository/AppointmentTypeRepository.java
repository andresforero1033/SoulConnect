package com.soulconnect.backend.repository;

import com.soulconnect.backend.model.AppointmentType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentTypeRepository extends JpaRepository<AppointmentType, UUID> {
    List<AppointmentType> findAllByOrderByNameAsc();
}
