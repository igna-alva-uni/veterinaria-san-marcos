-- CADA BASE DE DATOS DE CADA MICROSERVICIO DEBE TENER SU PROPIO
-- SCRIPT DE CREACIÓN DE TABLAS E INSERCIÓN DE DATOS

-- Conectarse a la base de datos específica para este microservicio
\c usuarios;

-- 1. ELIMINACIÓN (Orden jerárquico inverso)
DROP TABLE IF EXISTS usuarios;

-- 2. TABLAS MAESTRAS
CREATE TABLE usuarios (
    id                SERIAL       PRIMARY KEY,
    nombre            VARCHAR(150) NOT NULL,
    apellido          VARCHAR(150) NOT NULL,
    email             VARCHAR(150) UNIQUE NOT NULL,
    password          VARCHAR(50)  NOT NULL,
    rol               VARCHAR(50)  NOT NULL CHECK (rol IN (
                                   'Administrador', 
                                   'Bibliotecario', 
                                   'Cliente')),
    activo            BOOLEAN      DEFAULT TRUE
);

-- 3. INSERCIÓN DE DATOS

INSERT INTO usuarios (nombre, apellido, email, password, rol) VALUES
('Ana',      'Aguilar',   'ana@administrador.cl',    '123',  'Administrador'), -- ID 1
('Andrés',   'Acosta',    'andres@administrador.cl', '123',  'Administrador'), -- ID 2
('Adrián',   'Álvarez',   'adrian@administrador.cl', '123',  'Administrador'), -- ID 3
('Beatriz',  'Bermúdez',  'beatriz@bibliotecario.cl','123',  'Bibliotecario'), -- ID 4
('Benito',   'Barrios',   'benito@bibliotecario.cl', '123',  'Bibliotecario'), -- ID 5
('Belén',    'Bravo',     'belen@bibliotecario.cl',  '123',  'Bibliotecario'), -- ID 6
('Carlos',   'Contreras', 'carlos@cliente.cl',       '1234', 'Cliente'),       -- ID 7
('Camila',   'Cervantes', 'camila@cliente.cl',       '1234', 'Cliente'),       -- ID 8
('Cristian', 'Castro',    'cristian@cliente.cl',     '1234', 'Cliente');       -- ID 9
