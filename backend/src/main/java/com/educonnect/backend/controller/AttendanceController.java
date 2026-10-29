package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Attendance;
import com.educonnect.backend.entity.AttendanceRecord;
import com.educonnect.backend.entity.AttendanceSession;
import com.educonnect.backend.repository.AttendanceRecordRepository;
import com.educonnect.backend.repository.AttendanceRepository;
import com.educonnect.backend.repository.AttendanceSessionRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;

    public AttendanceController(
            AttendanceRepository attendanceRepository,
            AttendanceSessionRepository sessionRepository,
            AttendanceRecordRepository recordRepository) {
        this.attendanceRepository = attendanceRepository;
        this.sessionRepository = sessionRepository;
        this.recordRepository = recordRepository;
    }

    // =========================================================
    // 1. Existing Endpoints (Preserved for Student Module & Overview)
    // =========================================================

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getStudentAttendance(@PathVariable Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    @PostMapping
    public Attendance createAttendance(@RequestBody Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    // =========================================================
    // 2. Date-Specific Attendance Sessions (Teacher Roster Workflow)
    // =========================================================

    /**
     * Get all recent attendance sessions with summary metrics.
     */
    @GetMapping("/sessions")
    public List<SessionSummaryDto> getAllSessions() {
        List<AttendanceSession> sessions = sessionRepository.findAllByOrderByDateDesc();
        List<SessionSummaryDto> result = new ArrayList<>();

        for (AttendanceSession s : sessions) {
            List<AttendanceRecord> records = recordRepository.findBySessionId(s.getId());
            int total = records.size();
            int present = (int) records.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
            int absent = total - present;
            double pct = total > 0 ? (present * 100.0) / total : 0.0;

            result.add(new SessionSummaryDto(
                    s.getId(),
                    s.getSubject(),
                    s.getDate(),
                    total,
                    present,
                    absent,
                    Math.round(pct * 10.0) / 10.0,
                    s.getCreatedAt(),
                    s.getUpdatedAt()
            ));
        }

        return result;
    }

    /**
     * Get a specific attendance session by subject and date (with student-level records).
     * Returns null if no session has been recorded yet for this subject and date.
     */
    @GetMapping("/session")
    public SessionDetailDto getSession(
            @RequestParam String subject,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (subject == null || subject.trim().isEmpty() || date == null) {
            return null;
        }

        Optional<AttendanceSession> optSession = sessionRepository.findBySubjectAndDate(subject.trim(), date);
        if (optSession.isEmpty()) {
            return null;
        }

        AttendanceSession s = optSession.get();
        List<AttendanceRecord> records = recordRepository.findBySessionId(s.getId());
        int total = records.size();
        int present = (int) records.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
        int absent = total - present;
        double pct = total > 0 ? (present * 100.0) / total : 0.0;

        List<StudentRecordDto> recDtos = new ArrayList<>();
        for (AttendanceRecord r : records) {
            recDtos.add(new StudentRecordDto(r.getId(), r.getStudentId(), r.getStatus()));
        }

        return new SessionDetailDto(
                s.getId(),
                s.getSubject(),
                s.getDate(),
                total,
                present,
                absent,
                Math.round(pct * 10.0) / 10.0,
                recDtos,
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }

    /**
     * Save or update an entire class attendance session for a given date and subject.
     * Enforces uniqueness for (subject, date) and updates aggregate student records in sync.
     */
    @PostMapping("/session")
    @Transactional
    public SessionDetailDto saveSession(@RequestBody SessionSaveRequest request) {

        if (request.getSubject() == null || request.getSubject().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject is required.");
        }
        if (request.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date is required.");
        }
        if (request.getRecords() == null || request.getRecords().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one student record is required.");
        }

        String cleanSubject = request.getSubject().trim();
        LocalDate sessionDate = request.getDate();

        // 1. Find or create session (enforcing single session per subject + date)
        Optional<AttendanceSession> optSession = sessionRepository.findBySubjectAndDate(cleanSubject, sessionDate);
        boolean isNewSession = optSession.isEmpty();

        AttendanceSession session = optSession.orElseGet(() -> new AttendanceSession(cleanSubject, sessionDate));
        session = sessionRepository.save(session);
        Long sessionId = session.getId();

        // 2. Process each student's attendance record
        List<StudentRecordDto> savedRecordDtos = new ArrayList<>();
        int presentCount = 0;
        int absentCount = 0;

        for (StudentStatusItem item : request.getRecords()) {
            if (item.getStudentId() == null) continue;

            String status = ("ABSENT".equalsIgnoreCase(item.getStatus())) ? "ABSENT" : "PRESENT";
            if ("PRESENT".equals(status)) {
                presentCount++;
            } else {
                absentCount++;
            }

            Optional<AttendanceRecord> optRecord = recordRepository.findBySessionIdAndStudentId(sessionId, item.getStudentId());

            if (optRecord.isPresent()) {
                // UPDATE existing record in this session
                AttendanceRecord existingRec = optRecord.get();
                String previousStatus = existingRec.getStatus();
                existingRec.setStatus(status);
                AttendanceRecord savedRec = recordRepository.save(existingRec);
                savedRecordDtos.add(new StudentRecordDto(savedRec.getId(), savedRec.getStudentId(), savedRec.getStatus()));

                // Synchronize aggregate table if status changed
                if (!status.equalsIgnoreCase(previousStatus)) {
                    Optional<Attendance> optAgg = attendanceRepository.findByStudentIdAndSubject(item.getStudentId(), cleanSubject);
                    if (optAgg.isPresent()) {
                        Attendance agg = optAgg.get();
                        if ("ABSENT".equalsIgnoreCase(previousStatus) && "PRESENT".equalsIgnoreCase(status)) {
                            agg.setAttendedClasses(agg.getAttendedClasses() + 1);
                        } else if ("PRESENT".equalsIgnoreCase(previousStatus) && "ABSENT".equalsIgnoreCase(status)) {
                            agg.setAttendedClasses(Math.max(0, agg.getAttendedClasses() - 1));
                        }
                        attendanceRepository.save(agg);
                    }
                }
            } else {
                // INSERT new record for this student in this session
                AttendanceRecord newRec = new AttendanceRecord(sessionId, item.getStudentId(), status);
                AttendanceRecord savedRec = recordRepository.save(newRec);
                savedRecordDtos.add(new StudentRecordDto(savedRec.getId(), savedRec.getStudentId(), savedRec.getStatus()));

                // Synchronize aggregate table
                Optional<Attendance> optAgg = attendanceRepository.findByStudentIdAndSubject(item.getStudentId(), cleanSubject);
                if (optAgg.isPresent()) {
                    Attendance agg = optAgg.get();
                    agg.setTotalClasses(agg.getTotalClasses() + 1);
                    if ("PRESENT".equalsIgnoreCase(status)) {
                        agg.setAttendedClasses(agg.getAttendedClasses() + 1);
                    }
                    attendanceRepository.save(agg);
                } else {
                    int attended = "PRESENT".equalsIgnoreCase(status) ? 1 : 0;
                    Attendance agg = new Attendance(item.getStudentId(), cleanSubject, attended, 1);
                    attendanceRepository.save(agg);
                }
            }
        }

        int total = presentCount + absentCount;
        double pct = total > 0 ? (presentCount * 100.0) / total : 0.0;

        return new SessionDetailDto(
                session.getId(),
                session.getSubject(),
                session.getDate(),
                total,
                presentCount,
                absentCount,
                Math.round(pct * 10.0) / 10.0,
                savedRecordDtos,
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }

    // =========================================================
    // DTO Classes
    // =========================================================

    public static class SessionSaveRequest {
        private String subject;
        private LocalDate date;
        private List<StudentStatusItem> records;

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public List<StudentStatusItem> getRecords() { return records; }
        public void setRecords(List<StudentStatusItem> records) { this.records = records; }
    }

    public static class StudentStatusItem {
        private Long studentId;
        private String status; // "PRESENT" or "ABSENT"

        public Long getStudentId() { return studentId; }
        public void setStudentId(Long studentId) { this.studentId = studentId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class StudentRecordDto {
        private Long id;
        private Long studentId;
        private String status;

        public StudentRecordDto(Long id, Long studentId, String status) {
            this.id = id;
            this.studentId = studentId;
            this.status = status;
        }

        public Long getId() { return id; }
        public Long getStudentId() { return studentId; }
        public String getStatus() { return status; }
    }

    public static class SessionSummaryDto {
        private Long id;
        private String subject;
        private LocalDate date;
        private int totalStudents;
        private int presentCount;
        private int absentCount;
        private double attendancePercentage;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public SessionSummaryDto(Long id, String subject, LocalDate date,
                                 int totalStudents, int presentCount, int absentCount,
                                 double attendancePercentage, LocalDateTime createdAt, LocalDateTime updatedAt) {
            this.id = id;
            this.subject = subject;
            this.date = date;
            this.totalStudents = totalStudents;
            this.presentCount = presentCount;
            this.absentCount = absentCount;
            this.attendancePercentage = attendancePercentage;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public Long getId() { return id; }
        public String getSubject() { return subject; }
        public LocalDate getDate() { return date; }
        public int getTotalStudents() { return totalStudents; }
        public int getPresentCount() { return presentCount; }
        public int getAbsentCount() { return absentCount; }
        public double getAttendancePercentage() { return attendancePercentage; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
    }

    public static class SessionDetailDto {
        private Long id;
        private String subject;
        private LocalDate date;
        private int totalStudents;
        private int presentCount;
        private int absentCount;
        private double attendancePercentage;
        private List<StudentRecordDto> records;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public SessionDetailDto(Long id, String subject, LocalDate date,
                                int totalStudents, int presentCount, int absentCount,
                                double attendancePercentage, List<StudentRecordDto> records,
                                LocalDateTime createdAt, LocalDateTime updatedAt) {
            this.id = id;
            this.subject = subject;
            this.date = date;
            this.totalStudents = totalStudents;
            this.presentCount = presentCount;
            this.absentCount = absentCount;
            this.attendancePercentage = attendancePercentage;
            this.records = records;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public Long getId() { return id; }
        public String getSubject() { return subject; }
        public LocalDate getDate() { return date; }
        public int getTotalStudents() { return totalStudents; }
        public int getPresentCount() { return presentCount; }
        public int getAbsentCount() { return absentCount; }
        public double getAttendancePercentage() { return attendancePercentage; }
        public List<StudentRecordDto> getRecords() { return records; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
    }
}