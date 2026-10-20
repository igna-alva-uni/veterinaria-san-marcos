package com.duoc.biblioteca.exception;

/**
 * Excepción de dominio lanzada cuando se intenta registrar un libro
 * con un ISBN que ya existe en el sistema (violación de unicidad de negocio).
 *
 * Mapea al HTTP 409 CONFLICT, el código semánticamente correcto para
 * conflictos de estado del recurso (no un error del cliente per se).
 */
public class IsbnDuplicadoException extends RuntimeException {

    /**
     * @param isbn el ISBN que produjo el conflicto
     */
    public IsbnDuplicadoException(String isbn, String titulo) {
        super("Ya existe un libro registrado con el ISBN: " + isbn + ", el nombre del libro es '" + titulo + "'");
    }
}
