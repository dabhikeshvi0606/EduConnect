package com.educonnect.backend.entity;

import jakarta.persistence.*;

@Entity
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;

    private String subject;

    private int internalMarks;
    private int internalMax;

    private int assignmentMarks;
    private int assignmentMax;

    private int quizMarks;
    private int quizMax;

    private double percentage;

    private String grade;

    public Result() {
    }

    public Result(
            Long studentId,
            String subject,
            int internalMarks,
            int internalMax,
            int assignmentMarks,
            int assignmentMax,
            int quizMarks,
            int quizMax,
            double percentage,
            String grade) {

        this.studentId = studentId;
        this.subject = subject;
        this.internalMarks = internalMarks;
        this.internalMax = internalMax;
        this.assignmentMarks = assignmentMarks;
        this.assignmentMax = assignmentMax;
        this.quizMarks = quizMarks;
        this.quizMax = quizMax;
        this.percentage = percentage;
        this.grade = grade;
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

    public int getInternalMarks() {
        return internalMarks;
    }

    public void setInternalMarks(int internalMarks) {
        this.internalMarks = internalMarks;
    }

    public int getInternalMax() {
        return internalMax;
    }

    public void setInternalMax(int internalMax) {
        this.internalMax = internalMax;
    }

    public int getAssignmentMarks() {
        return assignmentMarks;
    }

    public void setAssignmentMarks(int assignmentMarks) {
        this.assignmentMarks = assignmentMarks;
    }

    public int getAssignmentMax() {
        return assignmentMax;
    }

    public void setAssignmentMax(int assignmentMax) {
        this.assignmentMax = assignmentMax;
    }

    public int getQuizMarks() {
        return quizMarks;
    }

    public void setQuizMarks(int quizMarks) {
        this.quizMarks = quizMarks;
    }

    public int getQuizMax() {
        return quizMax;
    }

    public void setQuizMax(int quizMax) {
        this.quizMax = quizMax;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }
}
