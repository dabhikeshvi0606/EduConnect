package com.educonnect.backend.repository;

import com.educonnect.backend.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {

    Optional<AttendanceSession> findBySubjectAndDate(String subject, LocalDate date);

    List<AttendanceSession> findAllByOrderByDateDesc();

    List<AttendanceSession> findBySubjectOrderByDateDesc(String subject);
}
