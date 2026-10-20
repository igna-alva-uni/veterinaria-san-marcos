-- CADA BASE DE DATOS DE CADA MICROSERVICIO DEBE TENER SU PROPIO
-- SCRIPT DE CREACIÓN DE TABLAS E INSERCIÓN DE DATOS

-- Conectarse a la base de datos específica para este microservicio
\c recursos

-- ============================================================
-- 1. ELIMINACIÓN (Orden jerárquico inverso)
-- ============================================================
DROP TABLE IF EXISTS historial_eventos_recursos_fisicos;
DROP TABLE IF EXISTS recursos_fisicos;
DROP TABLE IF EXISTS usuarios_ref;
DROP TABLE IF EXISTS libros_ref;

-- ============================================================
-- 2. PROYECCIONES MÍNIMAS LOCALES
-- ============================================================
CREATE TABLE libros_ref (
    isbn               VARCHAR(20)  PRIMARY KEY,
    titulo             VARCHAR(255) NOT NULL,
    editorial          VARCHAR(100) NOT NULL,
    anio_publicacion   INT          NOT NULL,
    autor              VARCHAR(150) NOT NULL
);

CREATE TABLE usuarios_ref (
    email              VARCHAR(150) PRIMARY KEY,
    nombre             VARCHAR(150) NOT NULL,
    apellido           VARCHAR(150) NOT NULL,
    rol                VARCHAR(50)  NOT NULL
);

-- ============================================================
-- 3. INVENTARIO (Recursos físicos)
-- ============================================================
CREATE TABLE recursos_fisicos (
    id                 SERIAL       PRIMARY KEY,
    sku                VARCHAR(50)  UNIQUE NOT NULL,
    tipo_recurso       VARCHAR(50)  NOT NULL CHECK (tipo_recurso IN (
                                    'Libro',
                                    'Notebook',
                                    'Tablet',
                                    'Juego de mesa')),
    isbn               VARCHAR(20),
    estado_fisico      VARCHAR(50)  DEFAULT 'Excelente' CHECK (estado_fisico IN (
                                    'Excelente',
                                    'Buen estado',
                                    'Dañado',
                                    'En reparación')),
    disponible         BOOLEAN      DEFAULT TRUE,
    FOREIGN KEY (isbn) REFERENCES libros_ref(isbn),
    CONSTRAINT chk_isbn_segun_tipo CHECK (
        (tipo_recurso = 'Libro' AND isbn IS NOT NULL) OR
        (tipo_recurso <> 'Libro')
    )
);

CREATE TABLE historial_eventos_recursos_fisicos (
    id                 SERIAL       PRIMARY KEY,
    usuario_email      VARCHAR(150) NOT NULL,
    recurso_id         INT          NOT NULL,
    fecha_evento       DATE         NOT NULL,
    fecha_entrega      DATE         DEFAULT NULL,
    monto_atraso       INT          DEFAULT 0,
    estado             VARCHAR(50)  NOT NULL CHECK (estado IN (
                                    'Creado',
                                    'Reservado',
                                    'Prestado',
                                    'Devuelto a tiempo',
                                    'Devuelto con atraso',
                                    'Perdido')),
    FOREIGN KEY (usuario_email) REFERENCES usuarios_ref(email),
    FOREIGN KEY (recurso_id)    REFERENCES recursos_fisicos(id)
);

-- ============================================================
-- 4. POBLAMIENTO DE PROYECCIONES
-- ============================================================
INSERT INTO libros_ref (isbn, titulo, editorial, anio_publicacion, autor) VALUES
('9798344055985', 'Moby Dick',            'Elderwand',   2024, 'Herman Melville'),
('9788437604947', 'Cien años de soledad', 'Cátedra',     2007, 'G. García Márquez'),
('9788420651323', 'El Principito',        'Alianza',     1943, 'A. de Saint-Exupéry'),
('9780141036137', '1984',                 'Penguin',     2008, 'George Orwell'),
('9788497592208', 'El resplandor',        'Debolsillo',  2012, 'Stephen King'),
('9781537822075', 'Dracula',              'Feltrinelli', 2011, 'Bram Stoker'),
('9788420674209', 'Don Quijote',          'Alianza',     2011, 'M. de Cervantes'),
('9781644732076', 'Harry Potter',         'Pottermore',  1997, 'J.K. Rowling'),
('9788445077412', 'El Hobbit',            'Minotauro',   2012, 'J.R.R. Tolkien');

INSERT INTO usuarios_ref (email, nombre, apellido, rol) VALUES
('ana@triskeledu.cl',    'Ana',      'Bibliotecaria', 'Bibliotecario'),
('carlos@triskeledu.cl', 'Carlos',   'Cliente',       'Cliente'),
('camila@triskeledu.cl', 'Camila',   'Cliente',       'Cliente'),
('cristian@triskeledu.cl','Cristian','Cliente',       'Cliente');

-- ============================================================
-- 5. INSERCIÓN DE DATOS EN RECURSOS FÍSICOS
-- ============================================================
INSERT INTO recursos_fisicos (sku, tipo_recurso, isbn) VALUES
('SKU-MOBY-001', 'Libro', '9798344055985'), -- ID 1:  Moby Dick     (Copia 1)
('SKU-CIEN-001', 'Libro', '9788437604947'), -- ID 2:  Cien años     (Copia 1)
('SKU-PRIN-001', 'Libro', '9788420651323'), -- ID 3:  Principito    (Copia 1)
('SKU-1984-001', 'Libro', '9780141036137'), -- ID 4:  1984          (Copia 1)
('SKU-RESP-001', 'Libro', '9788497592208'), -- ID 5:  Resplandor    (Copia 1)
('SKU-DRAC-001', 'Libro', '9781537822075'), -- ID 6:  Dracula       (Copia 1)
('SKU-DRAC-002', 'Libro', '9781537822075'), -- ID 7:  Dracula       (Copia 2)
('SKU-QUIJ-001', 'Libro', '9788420674209'), -- ID 8:  Don Quijote   (Copia 1)
('SKU-QUIJ-002', 'Libro', '9788420674209'), -- ID 9:  Don Quijote   (Copia 2)
('SKU-HARR-001', 'Libro', '9781644732076'), -- ID 10: Harry Potter  (Copia 1)
('SKU-HARR-002', 'Libro', '9781644732076'), -- ID 11: Harry Potter  (Copia 2)
('SKU-HARR-003', 'Libro', '9781644732076'), -- ID 12: Harry Potter  (Copia 3)
('SKU-HARR-004', 'Libro', '9781644732076'), -- ID 13: Harry Potter  (Copia 4)
('SKU-HOBB-001', 'Libro', '9788445077412'), -- ID 14: El Hobbit     (Copia 1)
('SKU-HOBB-002', 'Libro', '9788445077412'), -- ID 15: El Hobbit     (Copia 2)
('SKU-HOBB-003', 'Libro', '9788445077412'), -- ID 16: El Hobbit     (Copia 3)
('SKU-HOBB-004', 'Libro', '9788445077412'), -- ID 17: El Hobbit     (Copia 4)
('SKU-HOBB-005', 'Libro', '9788445077412'); -- ID 18: El Hobbit     (Copia 5)

-- ============================================================
-- 6. HISTORIAL DE EVENTOS
-- ============================================================
INSERT INTO historial_eventos_recursos_fisicos
(usuario_email, recurso_id, fecha_evento, fecha_entrega, monto_atraso, estado) VALUES

-- 1. EVENTOS CREADO
('ana@triskeledu.cl',     1,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',     2,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',     3,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',     4,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',     5,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',     6,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',     7,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',     8,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',     9,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',    10,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',    11,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',    12,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',    13,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',    14,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',    15,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',    16,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',    17,  '2025-11-01', NULL,         0,    'Creado'),
('ana@triskeledu.cl',    18,  '2025-11-01', NULL,         0,    'Creado'),

-- 2. CICLOS DE PRÉSTAMO Y DEVOLUCIÓN
('carlos@triskeledu.cl',  1,  '2025-11-02', '2025-11-02', 0,    'Prestado'),
('carlos@triskeledu.cl',  1,  '2025-11-09', NULL,         0,    'Devuelto a tiempo'),

('camila@triskeledu.cl',  2,  '2025-11-03', '2025-11-03', 0,    'Prestado'),
('camila@triskeledu.cl',  2,  '2025-11-15', NULL,         5000, 'Devuelto con atraso'),

('cristian@triskeledu.cl',3,  '2025-11-04', '2025-11-04', 0,    'Prestado'),
('cristian@triskeledu.cl',3,  '2025-11-11', NULL,         0,    'Devuelto a tiempo'),

-- 3. DRACULA
('cristian@triskeledu.cl',6,  '2025-11-02', '2025-11-02', 0,    'Prestado'),
('cristian@triskeledu.cl',6,  '2025-11-09', NULL,         0,    'Devuelto a tiempo'),
('carlos@triskeledu.cl',  6,  '2025-11-10', NULL,         0,    'Reservado'),

-- 4. DON QUIJOTE
('carlos@triskeledu.cl',  8,  '2025-11-02', '2025-11-02', 0,    'Prestado'),
('carlos@triskeledu.cl',  8,  '2025-11-12', NULL,         2500, 'Devuelto con atraso'),
('camila@triskeledu.cl',  8,  '2025-11-13', NULL,         0,    'Reservado'),
('cristian@triskeledu.cl',8,  '2025-11-21', NULL,         0,    'Reservado'),

-- 5. HARRY POTTER
('camila@triskeledu.cl', 10,  '2025-11-02', '2025-11-02', 0,    'Prestado'),
('camila@triskeledu.cl', 10,  '2025-11-09', NULL,         0,    'Devuelto a tiempo'),
('carlos@triskeledu.cl', 10,  '2025-11-10', NULL,         0,    'Reservado'),
('camila@triskeledu.cl', 10,  '2025-11-18', NULL,         0,    'Reservado'),
('cristian@triskeledu.cl',10, '2025-11-25', NULL,         0,    'Reservado'),

-- 6. EL HOBBIT
('carlos@triskeledu.cl', 14,  '2025-11-02', '2025-11-02', 0,    'Prestado'),
('carlos@triskeledu.cl', 14,  '2025-11-08', NULL,         0,    'Perdido'),
('camila@triskeledu.cl', 15,  '2025-11-10', NULL,         0,    'Reservado'),
('cristian@triskeledu.cl',15, '2025-11-18', NULL,         0,    'Reservado');