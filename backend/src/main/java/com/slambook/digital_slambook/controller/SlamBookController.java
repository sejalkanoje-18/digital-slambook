package com.slambook.digital_slambook.controller;

import com.slambook.digital_slambook.dto.SlamBookRequestDTO;
import com.slambook.digital_slambook.dto.SlamBookResponseDTO;
import com.slambook.digital_slambook.service.SlamBookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slam")
@RequiredArgsConstructor
public class SlamBookController {

    private final SlamBookService slamBookService;

    @GetMapping
    public ResponseEntity<List<SlamBookResponseDTO>> getAllSlamBooks() {
        return ResponseEntity.ok(slamBookService.getAllSlamBooks());
    }

    @PostMapping
    public ResponseEntity<SlamBookResponseDTO> createSlamBook(
            @Valid @RequestBody SlamBookRequestDTO requestDTO){

        SlamBookResponseDTO response = slamBookService.createSlamBook(requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);

    }

    @GetMapping("/{id}")
    public ResponseEntity<SlamBookResponseDTO> getSlamBookById(@PathVariable Long id){

        SlamBookResponseDTO response = slamBookService.getSlamBookById(id);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SlamBookResponseDTO> updateSlamBook(
            @PathVariable Long id,
            @Valid @RequestBody SlamBookRequestDTO requestDTO){

        SlamBookResponseDTO response = slamBookService.updateSlamBook(
                id,
                requestDTO
        );

        return ResponseEntity.ok(response);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSlamBook(
            @PathVariable Long id){

        slamBookService.deleteSlamBook(id);

        return ResponseEntity.noContent().build();
    }

}
