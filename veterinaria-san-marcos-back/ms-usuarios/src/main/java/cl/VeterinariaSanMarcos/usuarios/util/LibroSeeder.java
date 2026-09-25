package com.duoc.biblioteca.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.duoc.biblioteca.dto.LibroRequest;
import com.duoc.biblioteca.service.LibroService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class LibroSeeder implements CommandLineRunner {

    private final LibroService libroService;

    @Override
    public void run(String... args) {

        LibroRequest libro1 = buildRequest("9798344055985", "Moby Dick",
                "Elderwand Editions", 2024, "Herman Melville");

        LibroRequest libro2 = buildRequest("9781537822075", "Dracula",
                "Feltrinelli", 2011, "Bram Stoker");

        LibroRequest libro3 = buildRequest("9781644732076",
                "Harry Potter y la piedra filosofal / Harry Potter and the Sorcerer's Stone",
                "Pottermore Publishing", 1997, "J.K. Rowling");

        libroService.create(libro1);
        libroService.create(libro2);
        libroService.create(libro3);

        log.info("======================================");
        log.info("Seeder ejecutado: 3 libros registrados");
        log.info("  1. {}", libro1.getTitulo());
        log.info("  2. {}", libro2.getTitulo());
        log.info("  3. {}", libro3.getTitulo());
        log.info("======================================");
    }

    private LibroRequest buildRequest(String isbn, String titulo,
            String editorial, int anio, String autor) {
        LibroRequest req = new LibroRequest();
        req.setIsbn(isbn);
        req.setTitulo(titulo);
        req.setEditorial(editorial);
        req.setAnioPublicacion(anio);
        req.setAutor(autor);
        return req;
    }
}
