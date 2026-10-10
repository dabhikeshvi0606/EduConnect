
package com.educonnect.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long assignmentId;
    private Long studentId;
    private String fileName;
    private String storedFileName;
    private String filePath;
    private LocalDateTime submittedAt;

    public AssignmentSubmission() {}

    public Long getId() { return id; }
    public Long getAssignmentId() { return assignmentId; }
    public Long getStudentId() { return studentId; }
    public String getFileName() { return fileName; }
    public String getStoredFileName() { return storedFileName; }
    public String getFilePath() { return filePath; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }

    public void setId(Long id) { this.id = id; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}


