
package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.AssignmentSubmission;
import com.educonnect.backend.repository.AssignmentRepository;
import com.educonnect.backend.repository.AssignmentSubmissionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;

    public AssignmentController(
            AssignmentRepository assignmentRepository,
            AssignmentSubmissionRepository submissionRepository) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    @GetMapping
    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Assignment> getStudentAssignments(
            @PathVariable Long studentId) {
        return assignmentRepository.findByStudentId(studentId);
    }

    @PostMapping
    public Assignment createAssignment(
            @RequestBody Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    @PostMapping("/{assignmentId}/submit")
    @Transactional
    public AssignmentSubmission submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam Long studentId,
            @RequestParam("file") MultipartFile file) {

        Assignment assignment = assignmentRepository
                .findById(assignmentId)
                .filter(a -> a.getStudentId().equals(studentId))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Assignment not found for this student"));

        if (file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Please select a PDF");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "PDF must be 10 MB or smaller");
        }

        String originalName = file.getOriginalFilename();

        if (originalName == null
                || !originalName.toLowerCase().endsWith(".pdf")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "PDF files only");
        }

        try {
            byte[] bytes = file.getBytes();

            if (bytes.length < 5
                    || bytes[0] != '%'
                    || bytes[1] != 'P'
                    || bytes[2] != 'D'
                    || bytes[3] != 'F'
                    || bytes[4] != '-') {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "The selected file is not a valid PDF");
            }

            Path uploadDirectory = Paths.get(
                    "uploads", "assignments").toAbsolutePath().normalize();

            Files.createDirectories(uploadDirectory);

            String storedName = UUID.randomUUID() + ".pdf";
            Path destination = uploadDirectory.resolve(storedName);

            Files.write(destination, bytes);

            try {
                AssignmentSubmission submission =
                        new AssignmentSubmission();

                submission.setAssignmentId(assignmentId);
                submission.setStudentId(studentId);
                submission.setFileName(
                        Paths.get(originalName).getFileName().toString());
                submission.setStoredFileName(storedName);
                submission.setFilePath(destination.toString());
                submission.setSubmittedAt(LocalDateTime.now());

                AssignmentSubmission saved =
                        submissionRepository.save(submission);

                assignment.setStatus("submitted");
                assignmentRepository.save(assignment);

                return saved;

            } catch (RuntimeException ex) {
                Files.deleteIfExists(destination);
                throw ex;
            }

        } catch (IOException ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not save the PDF");
        }
    }
}

