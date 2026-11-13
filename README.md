# Veterinaria San Marcos

El proyecto usa React, tres microservicios Spring Boot, Eureka y un API Gateway.

## Iniciar con Docker

Requisitos: Docker Desktop con Docker Compose y Git. Los contenedores incluyen los runtimes de Java y Node.

Desde la raíz del repositorio, en PowerShell:

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose ps
```

Las contraseñas de `.env.example` son de desarrollo. Edita tu `.env` antes de inicializar la base si necesitas otros valores.

| Componente | Dirección local |
| --- | --- |
| Frontend | http://localhost:5173 |
| Eureka | http://localhost:8761 |
| API Gateway | http://localhost:9001 |
| Swagger | http://localhost:9001/swagger-ui.html |
| PostgreSQL | `localhost:5433`, base `veterinaria` |

Eureka muestra `MS-USUARIOS`, `MS-PACIENTES` y `MS-CITAS` cuando terminan de arrancar. Swagger permite seleccionar la especificación de cada servicio. En esta etapa las especificaciones todavía pueden tener `paths: {}` mientras se implementan los controladores.

Para ver los logs y detener el proyecto conservando los datos:

```powershell
docker compose logs -f postgres eureka ms-api-gateway ms-usuarios ms-pacientes ms-citas
docker compose down
```

## Esquemas de PostgreSQL

Un solo PostgreSQL aloja la base `veterinaria`. Los scripts de `veterinaria-san-marcos-back/init-multi-db` se aplican por orden al crear el volumen. Cada servicio usa una cuenta que puede operar sobre sus tablas y secuencias.

| Servicio | Esquema | Cuenta |
| --- | --- | --- |
| `ms-usuarios` | `usuarios` | `app_usuarios` |
| `ms-pacientes` | `pacientes` | `app_pacientes` |
| `ms-citas` | `citas` | `app_citas` |

Los scripts crean las tablas y cargan el catálogo inicial de servicios. Los IDs que apuntan a otro dominio se validarán mediante las APIs de los microservicios. Hibernate usa `ddl-auto: validate` para contrastar las entidades con el esquema SQL a medida que se incorporen.

Para verificar la base y el catálogo:

```powershell
docker compose exec postgres psql -U postgres -d veterinaria -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('usuarios', 'pacientes', 'citas') ORDER BY 1, 2"
docker compose exec postgres psql -U postgres -d veterinaria -c "SELECT count(*) FROM citas.catalogo_servicios"
```

Los scripts de inicialización se ejecutan sobre un volumen vacío. Para conservar una base existente al cambiar el esquema, apliquen una migración SQL. Para reiniciar una base local de prueba, `docker compose down --volumes` elimina sus datos y el siguiente arranque vuelve a cargar los scripts.

## Pruebas del backend

Con JDK 21 y Maven instalados, desde la raíz:

```powershell
mvn -f veterinaria-san-marcos-back/pom.xml test
```

Las pruebas de contexto usan H2 para los servicios de negocio. Para comprobar PostgreSQL y el enrutamiento a los servicios reales, inicien Compose y consulten `/openapi/usuarios`, `/openapi/pacientes` y `/openapi/citas` en el gateway.
