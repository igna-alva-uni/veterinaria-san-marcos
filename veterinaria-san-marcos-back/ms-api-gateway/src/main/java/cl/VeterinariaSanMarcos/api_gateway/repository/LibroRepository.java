package com.duoc.biblioteca.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.duoc.biblioteca.model.Libro;

@Repository
public class LibroRepository {

    private final List<Libro> listaLibros = new ArrayList<>();

    private int secuencia = 1;

    public List<Libro> findAll() {
        return List.copyOf(listaLibros); // Retorna copia inmutable (defensive copy)
    }

    public Optional<Libro> findById(int id) {
        return listaLibros.stream()
                .filter(l -> l.getId() == id)
                .findFirst();
    }

    public Optional<Libro> findByIsbn(String isbn) {
        return listaLibros.stream()
                .filter(l -> l.getIsbn().equalsIgnoreCase(isbn))
                .findFirst();
    }

    public Libro save(Libro libro) {
        libro.setId(secuencia++);
        listaLibros.add(libro);
        return libro;
    }

    public Optional<Libro> update(Libro libro) {
        return findById(libro.getId()).map(existente -> {
            existente.setIsbn(libro.getIsbn());
            existente.setTitulo(libro.getTitulo());
            existente.setEditorial(libro.getEditorial());
            existente.setAnioPublicacion(libro.getAnioPublicacion());
            existente.setAutor(libro.getAutor());
            return existente;
        });
    }

    public boolean deleteById(int id) {
        return listaLibros.removeIf(l -> l.getId() == id);
    }

    public boolean existsByIsbn(String isbn) {
        return listaLibros.stream()
                .anyMatch(l -> l.getIsbn().equalsIgnoreCase(isbn));
    }
}
