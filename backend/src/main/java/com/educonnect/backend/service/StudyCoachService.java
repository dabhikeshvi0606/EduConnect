package com.educonnect.backend.service;

import com.educonnect.backend.entity.Assignment;
import com.educonnect.backend.entity.Attendance;
import com.educonnect.backend.entity.Result;
import com.educonnect.backend.repository.AssignmentRepository;
import com.educonnect.backend.repository.AttendanceRepository;
import com.educonnect.backend.repository.ResultRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StudyCoachService {

    private final AttendanceRepository attendanceRepository;
    private final ResultRepository resultRepository;
    private final AssignmentRepository assignmentRepository;

    public StudyCoachService(
            AttendanceRepository attendanceRepository,
            ResultRepository resultRepository,
            AssignmentRepository assignmentRepository) {

        this.attendanceRepository = attendanceRepository;
        this.resultRepository = resultRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public Map<String, Object> generateStudyCoach(Long studentId) {

        List<Attendance> attendanceList =
                attendanceRepository.findByStudentId(studentId);

        List<Result> resultList =
                resultRepository.findByStudentId(studentId);

        List<Assignment> assignmentList =
                assignmentRepository.findByStudentId(studentId);

        Map<String, Object> response =
                new LinkedHashMap<>();

        // -----------------------------
        // OVERALL ATTENDANCE
        // -----------------------------

        int totalAttended = 0;
        int totalClasses = 0;

        for (Attendance attendance : attendanceList) {
            totalAttended += attendance.getAttendedClasses();
            totalClasses += attendance.getTotalClasses();
        }

        double overallAttendance = 0;

        if (totalClasses > 0) {
            overallAttendance =
                    (totalAttended * 100.0) / totalClasses;
        }

        // -----------------------------
        // OVERALL RESULT
        // -----------------------------

        double overallScore = 0;

        if (!resultList.isEmpty()) {

            double totalScore = 0;

            for (Result result : resultList) {
                totalScore += result.getPercentage();
            }

            overallScore =
                    totalScore / resultList.size();
        }

        // -----------------------------
        // STRONGEST SUBJECT
        // -----------------------------

        String strongestSubject = "Not available";
        double highestScore = -1;

        for (Result result : resultList) {

            if (result.getPercentage() > highestScore) {

                highestScore =
                        result.getPercentage();

                strongestSubject =
                        result.getSubject();
            }
        }

        // -----------------------------
        // NEEDS ATTENTION
        // -----------------------------

        String needsAttention = "Not available";
        double lowestScore = Double.MAX_VALUE;

        for (Result result : resultList) {

            if (result.getPercentage() < lowestScore) {

                lowestScore =
                        result.getPercentage();

                needsAttention =
                        result.getSubject();
            }
        }

        // -----------------------------
        // PENDING ASSIGNMENTS
        // -----------------------------

        int pendingAssignments = 0;

        for (Assignment assignment : assignmentList) {

            if ("pending".equalsIgnoreCase(
                    assignment.getStatus())) {

                pendingAssignments++;
            }
        }

        // -----------------------------
        // RECOMMENDATION
        // -----------------------------

        String recommendation;

        if (lowestScore < 75) {

            recommendation =
                    "Focus on " +
                    needsAttention +
                    ". Your current score is " +
                    String.format("%.0f", lowestScore) +
                    "%. Revise the core concepts and practice more questions.";

        }
        else if (overallAttendance < 75) {

            recommendation =
                    "Your attendance is " +
                    String.format("%.1f", overallAttendance) +
                    "%. Try to attend upcoming classes regularly.";

        }
        else if (pendingAssignments > 0) {

            recommendation =
                    "You have " +
                    pendingAssignments +
                    " pending assignment(s). Complete them on time to maintain steady academic progress.";

        }
        else {

            recommendation =
                    "Your academic performance is on track. Continue regular revision and practice.";
        }

        // -----------------------------
        // STUDY PLAN
        // -----------------------------

        List<Map<String, Object>> studyPlan =
                new ArrayList<>();

        if (!needsAttention.equals("Not available")) {

            studyPlan.add(
                    createPlanItem(
                            "Revise " + needsAttention + " concepts",
                            30
                    )
            );

            studyPlan.add(
                    createPlanItem(
                            "Practice questions",
                            30
                    )
            );

            studyPlan.add(
                    createPlanItem(
                            "Review notes and key points",
                            20
                    )
            );
        }

        // -----------------------------
        // RESPONSE
        // -----------------------------

        response.put(
                "overallScore",
                Math.round(overallScore * 10.0) / 10.0
        );

        response.put(
                "overallAttendance",
                Math.round(overallAttendance * 10.0) / 10.0
        );

        response.put(
                "strongestSubject",
                strongestSubject
        );

        response.put(
                "needsAttention",
                needsAttention
        );

        response.put(
                "lowestScore",
                Math.round(lowestScore * 10.0) / 10.0
        );

        response.put(
                "pendingAssignments",
                pendingAssignments
        );

        response.put(
                "recommendation",
                recommendation
        );

        response.put(
                "studyPlan",
                studyPlan
        );

        return response;
    }

    private Map<String, Object> createPlanItem(
            String title,
            int minutes) {

        Map<String, Object> item =
                new LinkedHashMap<>();

        item.put("title", title);
        item.put("minutes", minutes);

        return item;
    }
}
