package com.duoc.biblioteca.exception;

/**
 * Excepción de dominio lanzada cuando un Libro no es encontrado por ID o ISBN.
 *
 * Extiende RuntimeException (unchecked) para no contaminar las firmas de los
 * métodos de servicio con throws, siguiendo la convención de Spring Framework
 * y microservicios modernos (ej: Netflix Hystrix, Spring Data).
 */
public class LibroNotFoundException extends RuntimeException {

    /**
     * @param id identificador por el que se buscó el libro
     */
    public LibroNotFoundException(int id) {
        super("No se encontró ningún libro con ID: " + id);
    }

    /**
     * @param isbn código ISBN por el que se buscó el libro
     */
    public LibroNotFoundException(String isbn) {
        super("No se encontró ningún libro con ISBN: " + isbn);
    }
}
