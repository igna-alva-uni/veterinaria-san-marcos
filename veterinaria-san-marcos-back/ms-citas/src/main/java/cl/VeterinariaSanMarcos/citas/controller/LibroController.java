package com.duoc.biblioteca.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.duoc.biblioteca.dto.LibroRequest;
import com.duoc.biblioteca.dto.LibroResponse;
import com.duoc.biblioteca.service.LibroService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/libros")
public class LibroController {

    private final LibroService libroService;

    @GetMapping
    public ResponseEntity<List<LibroResponse>> findAll() {
        return ResponseEntity.ok(libroService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LibroResponse> findById(@PathVariable int id) {
        return ResponseEntity.ok(libroService.findById(id));
    }

    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<LibroResponse> findByIsbn(@PathVariable String isbn) {
        return ResponseEntity.ok(libroService.findByIsbn(isbn));
    }

    @PostMapping
    public ResponseEntity<LibroResponse> create(@Valid @RequestBody LibroRequest request) {
        LibroResponse creado = libroService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LibroResponse> update(
            @PathVariable int id,
            @Valid @RequestBody LibroRequest request) {
        return ResponseEntity.ok(libroService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable int id) {
        libroService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
