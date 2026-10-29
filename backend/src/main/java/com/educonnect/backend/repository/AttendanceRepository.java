package com.educonnect.backend.repository;

import com.educonnect.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentId(Long studentId);

    Optional<Attendance> findByStudentIdAndSubject(Long studentId, String subject);
}