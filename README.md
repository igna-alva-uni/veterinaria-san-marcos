# Veterinaria San Marcos

Tienda y gestión clínica veterinaria · DSY1104 Desarrollo Fullstack II.

El proyecto usa React (Vite), tres microservicios Spring Boot (`ms-usuarios`, `ms-pacientes`, `ms-citas`), una librería común (`ms-commons`), Eureka, un API Gateway y PostgreSQL. La autenticación es con JWT y cada microservicio valida el token y el rol por su cuenta.

| Carpeta                          | Contenido                                         |
| -------------------------------- | ------------------------------------------------- |
| `veterinaria-san-marcos-front` | Frontend React                                    |
| `veterinaria-san-marcos-back`  | Backend Spring Boot (proyecto Maven multimódulo) |

## Qué permite hacer el sistema

El proyecto reúne la atención clínica y la tienda de Veterinaria San Marcos. Un dueño puede registrar una mascota, solicitar una hora y consultar su historial. Recepción gestiona la agenda y las atenciones. Administración mantiene las cuentas y los catálogos. La tienda comparte la sesión con el área clínica y registra los pedidos con los precios vigentes al comprar.

| Capa                 | Tecnologías                                                         | Función en este proyecto                          |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------------- |
| Interfaz             | React 19, React Router 7, Tailwind CSS 4, Vite 8                     | Formularios, navegación por rol y cliente HTTP    |
| API y descubrimiento | Java 21, Spring Boot 3.5.14, Spring Cloud Gateway, Eureka, OpenFeign | Entrada por el gateway y consultas entre servicios |
| Persistencia         | PostgreSQL 16, Spring Data JPA e Hibernate                           | Un esquema y una cuenta de aplicación por dominio |
| Desarrollo           | Maven, npm, Docker Compose, Vitest y H2                              | Compilación, ejecución local y pruebas           |

## Recorrido de una reserva

1. El dueño inicia sesión. Usuarios comprueba las credenciales y devuelve un JWT.
2. En la pantalla de reserva elige una de sus mascotas, un servicio y una hora. React envía la solicitud a `/api/v1/citas`.
3. El gateway localiza Citas mediante Eureka. Citas consulta la ficha en Pacientes con el token de la solicitud, comprueba especie y disponibilidad, y guarda la reserva en PostgreSQL.
4. El dueño puede consultar la cita y recepción puede confirmarla o reprogramarla.

Para probar la interfaz por rol, consulta el [manual de usuario](docs/MANUAL_USUARIO.md). Para seguir una petición hasta el código, consulta el [documento de integración](docs/INTEGRACION.md).

## Comprobación de extremo a extremo

Con los contenedores iniciados, este ejemplo lee el catálogo por las dos entradas. La primera consulta pasa por el gateway. La segunda también atraviesa el proxy del frontend.

```powershell
$gateway = Invoke-RestMethod http://localhost:9001/api/v1/productos
$frontend = Invoke-RestMethod http://localhost:5173/api/v1/productos
$gateway.Count
$frontend.Count
```

Ambas consultas deberían devolver la misma cantidad para el mismo catálogo. Si el gateway responde y Vite falla, revisa el destino del proxy. Si ambas fallan, comprueba el registro de `MS-CITAS` en Eureka y los registros de `ms-citas`.

## Iniciar con Docker

Requisitos: Docker Desktop con Docker Compose y Git. Los contenedores incluyen los runtimes de Java y Node.

Desde la raíz del repositorio, en PowerShell:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
docker compose up --build -d
docker compose ps
```

Las contraseñas y la clave JWT de `.env.example` son de desarrollo. Edita tu `.env` antes de inicializar la base si necesitas otros valores. `.env` está en `.gitignore` y no se sube al repositorio.

> **Si usas una base de una versión anterior**, revisa los cambios de esquema antes de iniciar. Para conservar los datos, aplica una migración. En un entorno de prueba descartable, `docker compose down --volumes` elimina el volumen y todos sus datos. El próximo arranque vuelve a ejecutar los scripts iniciales.

| Componente  | Dirección local                         |
| ----------- | ---------------------------------------- |
| Frontend    | http://localhost:5173                    |
| Eureka      | http://localhost:8761                    |
| API Gateway | http://localhost:9001                    |
| Swagger     | http://localhost:9001/swagger-ui.html    |
| PostgreSQL  | `localhost:5433`, base `veterinaria` |

Eureka muestra `MS-USUARIOS`, `MS-PACIENTES` y `MS-CITAS` cuando terminan de arrancar (puede tardar uno o dos minutos la primera vez). En Swagger se selecciona la especificación de cada servicio en el menú superior.

Para ver los logs y detener el proyecto conservando los datos:

```powershell
docker compose logs -f postgres eureka ms-api-gateway ms-usuarios ms-pacientes ms-citas
docker compose down
```

## Cuentas de demostración

`ms-usuarios` las crea al iniciar si la tabla de usuarios está vacía (contraseñas guardadas con BCrypt).

| Rol               | Correo                       | Contraseña      |
| ----------------- | ---------------------------- | ---------------- |
| Administrador     | `admin@duocuc.cl`          | `Admin12345`   |
| Recepcionista     | `recepcion@gmail.com`      | `Recepcion123` |
| Dueño de mascota | `cliente@profesor.duoc.cl` | `Cliente123`   |

Los scripts SQL cargan además dos mascotas del cliente (Luna y Michi), su historial, una vacuna por vencer, 31 servicios, 22 productos y una cita pendiente para el día siguiente.

## Seguridad

- `POST /api/v1/auth/login` valida el correo y el hash BCrypt y devuelve un JWT HS256 con `sub` (id), `email`, `nombre`, `rol` y `exp`.
- El frontend guarda el token y su expiración en `localStorage` (`vet_sesion`), lo envía como `Authorization: Bearer` y, al recargar, confirma la sesión con `GET /api/v1/auth/me`.
- Cada microservicio tiene su `SecurityConfig` y valida el token con el filtro de `ms-commons`; los permisos por rol están en `@PreAuthorize` y en las reglas de cada servicio (por ejemplo, un dueño solo ve sus mascotas).
- Respuestas: `401` sin token o con token vencido/inválido; `403` cuando el rol no tiene permiso.
- `JWT_EXPIRATION_MINUTES` controla la duración del token (60 por defecto; con 2 se puede mostrar la expiración en el video).

## Endpoints principales

| Servicio     | Recurso               | Operaciones                                                                                                                                                               |
| ------------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ms-usuarios  | `/api/v1/auth`      | `POST /login`, `POST /registro`, `GET /me`                                                                                                                          |
| ms-usuarios  | `/api/v1/usuarios`  | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `PUT /me`, `PATCH /{id}/estado`, `DELETE /{id}`                                                                    |
| ms-pacientes | `/api/v1/pacientes` | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `PATCH /{id}/observaciones`, `DELETE /{id}`, `GET/POST /{id}/atenciones`, `DELETE /{id}/atenciones/{idAtencion}` |
| ms-citas     | `/api/v1/citas`     | `GET`, `GET /{id}`, `POST`, `PATCH /{id}/estado`, `PATCH /{id}/reprogramar`, `DELETE /{id}`                                                                   |
| ms-citas     | `/api/v1/servicios` | `GET` (público), `GET /{codigo}`, `POST`, `PUT /{codigo}`, `DELETE /{codigo}`                                                                                  |
| ms-citas     | `/api/v1/productos` | `GET` (público), `GET /{codigo}`, `POST`, `PUT /{codigo}`, `PATCH /{codigo}/stock`, `DELETE /{codigo}`                                                       |
| ms-citas     | `/api/v1/pedidos`   | `POST`, `GET /mios`, `GET`, `GET /{id}`, `PATCH /{id}/estado`, `DELETE /{id}`                                                                                 |

El detalle de roles por endpoint y los flujos están en [`docs/INTEGRACION.md`](docs/INTEGRACION.md).

## Esquemas de PostgreSQL

Un solo PostgreSQL aloja la base `veterinaria`. Los scripts de `veterinaria-san-marcos-back/init-multi-db` se aplican por orden al crear el volumen. Cada servicio usa una cuenta que puede operar sobre sus tablas y secuencias.

| Servicio         | Esquema       | Cuenta            | Tablas                                                                            |
| ---------------- | ------------- | ----------------- | --------------------------------------------------------------------------------- |
| `ms-usuarios`  | `usuarios`  | `app_usuarios`  | `usuarios`                                                                      |
| `ms-pacientes` | `pacientes` | `app_pacientes` | `pacientes`, `atenciones_clinicas`, `historial_vacunas`                     |
| `ms-citas`     | `citas`     | `app_citas`     | `catalogo_servicios`, `citas`, `productos`, `pedidos`, `pedido_detalle` |

Los servicios usan OpenFeign para consultas entre dominios. Por ejemplo, al reservar una cita se consulta la mascota y al eliminar un cliente se comprueba si tiene mascotas. Hibernate usa `ddl-auto: none` porque el esquema lo definen los scripts; con `JPA_DDL_AUTO=validate` se puede contrastar contra las entidades.

Para verificar la base y el catálogo:

```powershell
docker compose exec postgres psql -U postgres -d veterinaria -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('usuarios', 'pacientes', 'citas') ORDER BY 1, 2"
docker compose exec postgres psql -U postgres -d veterinaria -c "SELECT count(*) FROM citas.productos"
```

## Pruebas

Backend (JDK 21 y Maven), desde la raíz:

```powershell
mvn -f veterinaria-san-marcos-back/pom.xml test
```

Las pruebas de contexto levantan cada servicio con H2. `ReglasUsuarioTest` cubre la validación del RUN y del dominio de correo.

Frontend:

```powershell
cd veterinaria-san-marcos-front
npm install
npm test
```

`src/api/sesion.test.js` y `src/api/cliente.test.js` prueban la persistencia de la sesión, el envío del token y el manejo de 401/403/409. Las pruebas de la EP2 que simulaban el backend con `localStorage` quedaron excluidas en `vite.config.js` (se conservan como referencia).

## Ejecutar Java y React en el host con PostgreSQL en Docker

1. Levantar solo la base: `docker compose up -d postgres`.
2. Definir en la terminal las variables `JWT_SECRET`, `DB_USUARIOS_PASSWORD`, `DB_PACIENTES_PASSWORD` y `DB_CITAS_PASSWORD` con los valores de tu `.env`.
3. Desde `veterinaria-san-marcos-back`, instalar los módulos una vez con `mvn -DskipTests install` y luego iniciar en orden `eureka`, `ms-usuarios`, `ms-pacientes`, `ms-citas` y `ms-api-gateway`, cada uno en su terminal: `mvn -f <modulo>/pom.xml spring-boot:run`.
4. En `veterinaria-san-marcos-front`: `npm install` y `npm run dev`. Vite reenvía `/api` a `http://localhost:9001`.

## Guías por componente

| Guía                                                                               | Cuándo consultarla                                                |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Frontend](veterinaria-san-marcos-front/README.md)                                   | Ejecutar React y configurar el acceso a la API desde Vite          |
| [Backend](veterinaria-san-marcos-back/README.md)                                     | Levantar los servicios y entender los puertos, Eureka y el gateway |
| [Inicialización de PostgreSQL](veterinaria-san-marcos-back/init-multi-db/README.md) | Revisar la creación de roles, tablas y datos iniciales            |
| [Usuarios](veterinaria-san-marcos-back/ms-usuarios/README.md)                        | Consultar registro, autenticación y administración de cuentas    |
| [Pacientes](veterinaria-san-marcos-back/ms-pacientes/README.md)                      | Trabajar con fichas, atenciones y permisos por mascota             |
| [Citas](veterinaria-san-marcos-back/ms-citas/README.md)                              | Consultar la agenda, los catálogos, el inventario y los pedidos   |
