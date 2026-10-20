package com.duoc.biblioteca.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Libro {

    private Integer id;
    
    private String isbn;
    private String titulo;
    private String editorial;
    private Integer anioPublicacion;
    private String autor;

}
