
package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Quiz;
import com.educonnect.backend.repository.QuizRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class QuizController {

    private final QuizRepository quizRepository;

    public QuizController(QuizRepository quizRepository) {
        this.quizRepository = quizRepository;
    }

    @GetMapping
    public List<Quiz> getActiveQuizzes() {
        return quizRepository.findByActiveTrue();
    }

    @GetMapping("/{id}")
    public Quiz getQuiz(@PathVariable Long id) {
        return quizRepository.findById(id)
            .filter(Quiz::isActive)
            .orElseThrow(() ->
                new org.springframework.web.server
                    .ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "Quiz not found"
                    )
            );
    }

    @PostMapping
    public Quiz createQuiz(@RequestBody Quiz quiz) {
        return quizRepository.save(quiz);
    }
}
