package com.educonnect.backend.entity;

import jakarta.persistence.*;

@Entity
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;

    private String subject;

    private int attendedClasses;

    private int totalClasses;

    public Attendance() {
    }

    public Attendance(Long studentId, String subject,
                      int attendedClasses, int totalClasses) {
        this.studentId = studentId;
        this.subject = subject;
        this.attendedClasses = attendedClasses;
        this.totalClasses = totalClasses;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public int getAttendedClasses() {
        return attendedClasses;
    }

    public void setAttendedClasses(int attendedClasses) {
        this.attendedClasses = attendedClasses;
    }

    public int getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(int totalClasses) {
        this.totalClasses = totalClasses;
    }

    public double getPercentage() {

        if (totalClasses == 0) {
            return 0;
        }

        return (attendedClasses * 100.0) / totalClasses;
    }
}
