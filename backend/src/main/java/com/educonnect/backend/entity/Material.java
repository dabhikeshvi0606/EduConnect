package com.educonnect.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String subject;

    private String type;

    private String description;

    private LocalDate updatedDate;

    private String resourceInfo;

    private Long studentId;


    public Material() {
    }


    public Material(
            String title,
            String subject,
            String type,
            String description,
            LocalDate updatedDate,
            String resourceInfo,
            Long studentId) {

        this.title = title;
        this.subject = subject;
        this.type = type;
        this.description = description;
        this.updatedDate = updatedDate;
        this.resourceInfo = resourceInfo;
        this.studentId = studentId;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }


    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public LocalDate getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDate updatedDate) {
        this.updatedDate = updatedDate;
    }


    public String getResourceInfo() {
        return resourceInfo;
    }

    public void setResourceInfo(String resourceInfo) {
        this.resourceInfo = resourceInfo;
    }


    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
}