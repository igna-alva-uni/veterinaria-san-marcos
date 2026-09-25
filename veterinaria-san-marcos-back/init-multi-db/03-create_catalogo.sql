-- CADA BASE DE DATOS DE CADA MICROSERVICIO DEBE TENER SU PROPIO
-- SCRIPT DE CREACIÓN DE TABLAS E INSERCIÓN DE DATOS

-- Conectarse a la base de datos específica para este microservicio
\c catalogo

-- 1. ELIMINACIÓN (Orden jerárquico inverso)
DROP TABLE IF EXISTS libro_categoria;
DROP TABLE IF EXISTS libros;
DROP TABLE IF EXISTS categorias;

-- 2. TABLAS MAESTRAS
CREATE TABLE categorias (
    id                SERIAL       PRIMARY KEY,
    nombre            VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE libros (
    id                SERIAL       PRIMARY KEY,
    isbn              VARCHAR(20)  UNIQUE NOT NULL,
    titulo            VARCHAR(255) NOT NULL,
    editorial         VARCHAR(100) NOT NULL,
    anio_publicacion  INT          NOT NULL,
    autor             VARCHAR(150) NOT NULL
);

-- 3. RELACIONES Y EVENTOS
CREATE TABLE libro_categoria (
    id                SERIAL        PRIMARY KEY,
    libro_id          INT           NOT NULL,
    categoria_id      INT           NOT NULL,
    FOREIGN KEY (libro_id)          REFERENCES libros(id),
    FOREIGN KEY (categoria_id)      REFERENCES categorias(id),
    UNIQUE (libro_id, categoria_id) -- Evita libros duplicados en la misma categoría
);

-- 5. INSERCIÓN DE DATOS

INSERT INTO categorias (nombre) VALUES 
('Novela'), ('Terror'), ('Fantasía'), ('Aventura'), ('Clásico'), ('Drama'), ('Distopía'), ('Infantil');

INSERT INTO libros (isbn, titulo, editorial, anio_publicacion, autor) VALUES
('9798344055985', 'Moby Dick',            'Elderwand',   2024, 'Herman Melville'),     -- ID 1
('9788437604947', 'Cien años de soledad', 'Cátedra',     2007, 'G. García Márquez'),   -- ID 2
('9788420651323', 'El Principito',        'Alianza',     1943, 'A. de Saint-Exupéry'), -- ID 3
('9780141036137', '1984',                 'Penguin',     2008, 'George Orwell'),       -- ID 4
('9788497592208', 'El resplandor',        'Debolsillo',  2012, 'Stephen King'),        -- ID 5
('9781537822075', 'Dracula',              'Feltrinelli', 2011, 'Bram Stoker'),         -- ID 6
('9788420674209', 'Don Quijote',          'Alianza',     2011, 'M. de Cervantes'),     -- ID 7
('9781644732076', 'Harry Potter',         'Pottermore',  1997, 'J.K. Rowling'),        -- ID 8
('9788445077412', 'El Hobbit',            'Minotauro',   2012, 'J.R.R. Tolkien');      -- ID 9

-- ASOCIACIONES LIBRO_CATEGORIA (Alineado con ID y comentarios detallados)
INSERT INTO libro_categoria (libro_id, categoria_id) VALUES
(1, 4), -- ID 1: Moby Dick            (Aventura)
(1, 5), -- ID 2: Moby Dick            (Clásico)
(2, 1), -- ID 3: Cien años de soledad (Novela)
(2, 5), -- ID 4: Cien años de soledad (Clásico)
(3, 8), -- ID 5: El Principito        (Infantil)
(3, 5), -- ID 6: El Principito        (Clásico)
(4, 1), -- ID 7: 1984                 (Novela)
(4, 7), -- ID 8: 1984                 (Distopía)
(5, 2), -- ID 9: El resplandor        (Terror)
(5, 6), -- ID 10: El resplandor       (Drama)
(6, 2), -- ID 11: Dracula             (Terror)
(6, 5), -- ID 12: Dracula             (Clásico)
(7, 4), -- ID 13: Don Quijote         (Aventura)
(7, 5), -- ID 14: Don Quijote         (Clásico)
(8, 3), -- ID 15: Harry Potter        (Fantasía)
(8, 4), -- ID 16: Harry Potter        (Aventura)
(9, 3), -- ID 17: El Hobbit           (Fantasía)
(9, 4); -- ID 18: El Hobbit           (Aventura)