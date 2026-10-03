package com.educonnect.backend.controller;

import com.educonnect.backend.entity.Material;
import com.educonnect.backend.repository.MaterialRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class MaterialController {

    private final MaterialRepository materialRepository;

    public MaterialController(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    @GetMapping
    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    @GetMapping("/student/{studentId}")
    public List<Material> getStudentMaterials(
            @PathVariable Long studentId) {

        return materialRepository.findByStudentId(studentId);
    }

    @PostMapping
    public Material createMaterial(
            @RequestBody Material material) {

        return materialRepository.save(material);
    }
}