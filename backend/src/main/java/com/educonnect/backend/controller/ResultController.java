package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Result;
import com.educonnect.backend.repository.ResultRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class ResultController {

    private final ResultRepository resultRepository;

    public ResultController(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    @GetMapping
    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Result> getStudentResults(
            @PathVariable Long studentId) {

        return resultRepository.findByStudentId(studentId);
    }

    @PostMapping
    public Result createResult(
            @RequestBody Result result) {

        return resultRepository.save(result);
    }
}