package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialRepository
        extends JpaRepository<Material, Long> {

    List<Material> findByStudentId(Long studentId);
}