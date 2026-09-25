package com.duoc.biblioteca.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.duoc.biblioteca.dto.LibroRequest;
import com.duoc.biblioteca.dto.LibroResponse;
import com.duoc.biblioteca.exception.IsbnDuplicadoException;
import com.duoc.biblioteca.exception.LibroNotFoundException;
import com.duoc.biblioteca.mapper.LibroMapper;
import com.duoc.biblioteca.model.Libro;
import com.duoc.biblioteca.repository.LibroRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LibroService {

    private final LibroRepository libroRepository;
    private final LibroMapper libroMapper;

    public List<LibroResponse> findAll() {
        return libroRepository.findAll()
                .stream()
                .map(libroMapper::toResponse)
                .collect(Collectors.toList());
    }

    public LibroResponse findById(int id) {
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new LibroNotFoundException(id));
        return libroMapper.toResponse(libro);
    }

    public LibroResponse findByIsbn(String isbn) {
        Libro libro = libroRepository.findByIsbn(isbn)
                .orElseThrow(() -> new LibroNotFoundException(isbn));
        return libroMapper.toResponse(libro);
    }

    public LibroResponse create(LibroRequest request) {
        if (libroRepository.existsByIsbn(request.getIsbn())) {
            throw new IsbnDuplicadoException(request.getIsbn(), request.getTitulo());
        }

        Libro libro = libroMapper.toModel(request);
        Libro guardado = libroRepository.save(libro);
        return libroMapper.toResponse(guardado);
    }

    public LibroResponse update(int id, LibroRequest request) {
        LibroResponse actual = findById(id); // Lanza 404 si no existe

        if (!actual.getIsbn().equalsIgnoreCase(request.getIsbn())
                && libroRepository.existsByIsbn(request.getIsbn())) {
            throw new IsbnDuplicadoException(request.getIsbn(), request.getTitulo());
        }

        Libro libroActualizado = libroMapper.toModel(request);
        libroActualizado.setId(id);

        return libroRepository.update(libroActualizado)
                .map(libroMapper::toResponse)
                .orElseThrow(() -> new LibroNotFoundException(id));
    }

    public void deleteById(int id) {
        if (!libroRepository.deleteById(id)) {
            throw new LibroNotFoundException(id);
        }
    }
}
