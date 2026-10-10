package com.educonnect.backend.controller;

import com.educonnect.backend.service.StudyCoachService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/study-coach")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class StudyCoachController {

    private final StudyCoachService studyCoachService;

    public StudyCoachController(
            StudyCoachService studyCoachService) {

        this.studyCoachService =
                studyCoachService;
    }

    @GetMapping("/student/{studentId}")
    public Map<String, Object> getStudyCoach(
            @PathVariable Long studentId) {

        return studyCoachService
                .generateStudyCoach(studentId);
    }
}
