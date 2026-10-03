package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Attendance;
import com.educonnect.backend.repository.AttendanceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;

    public AttendanceController(AttendanceRepository attendanceRepository) {
        this.attendanceRepository = attendanceRepository;
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getStudentAttendance(
            @PathVariable Long studentId) {

        return attendanceRepository.findByStudentId(studentId);
    }

    @PostMapping
    public Attendance createAttendance(
            @RequestBody Attendance attendance) {

        return attendanceRepository.save(attendance);
    }
}