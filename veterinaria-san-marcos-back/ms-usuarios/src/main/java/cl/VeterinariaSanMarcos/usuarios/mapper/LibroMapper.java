package com.duoc.biblioteca.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.duoc.biblioteca.dto.LibroRequest;
import com.duoc.biblioteca.dto.LibroResponse;
import com.duoc.biblioteca.model.Libro;

@Mapper(componentModel  = "spring")
public interface LibroMapper {

    @Mapping(target = "id", ignore = true)
    Libro toModel(LibroRequest request);

    LibroResponse toResponse(Libro libro);

    List<LibroResponse> toResponseList(List<Libro> libros);
// 
}
