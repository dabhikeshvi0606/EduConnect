package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.repository.AssignmentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class AssignmentController {

    private final AssignmentRepository assignmentRepository;

    public AssignmentController(
            AssignmentRepository assignmentRepository) {

        this.assignmentRepository = assignmentRepository;
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
}