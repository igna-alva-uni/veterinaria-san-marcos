# Inicialización de PostgreSQL

Al iniciar PostgreSQL 16 con un volumen vacío, Compose monta esta carpeta en `/docker-entrypoint-initdb.d`. El contenedor ejecuta los archivos SQL en orden sobre la base `veterinaria`. Cada servicio accede con su propio rol y esquema.

| Orden | Script | Qué prepara |
| --- | --- | --- |
| 00 | [Roles](00-roles.sql) | Lee las tres contraseñas del entorno con `\getenv`, crea los roles de aplicación y revoca los permisos de `PUBLIC` sobre el esquema `public` |
| 01 | [Usuarios](01-usuarios.sql) | Esquema `usuarios`, tabla de usuarios y permisos para `app_usuarios`. Las cuentas de demostración las crea el servicio Java al arrancar con la tabla vacía |
| 02 | [Pacientes](02-pacientes.sql) | Esquema `pacientes`, mascotas, atenciones e historial de vacunas. Carga las fichas de Luna y Michi y otorga permisos a `app_pacientes` |
| 03 | [Citas](03-citas.sql) | Esquema `citas`, catálogos de servicios y productos, agenda, pedidos y detalle. Carga el catálogo y una cita de ejemplo y otorga permisos a `app_citas` |

## Iniciar y verificar

Desde la raíz del proyecto, copia `.env.example` a `.env` si aún falta. Define `POSTGRES_PASSWORD` y las variables `DB_USUARIOS_PASSWORD`, `DB_PACIENTES_PASSWORD` y `DB_CITAS_PASSWORD` antes del primer arranque.

```powershell
docker compose up -d postgres
docker compose logs postgres
docker compose exec postgres psql -U postgres -d veterinaria -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname IN ('usuarios','pacientes','citas') ORDER BY 1,2"
```

La consulta debe devolver nueve tablas repartidas entre los tres esquemas. Para conectarte desde el host usa `localhost:5433`. Dentro de Compose el servidor es `postgres:5432`.

## Modelo y relaciones

| Esquema | Relaciones y restricciones |
| --- | --- |
| `usuarios` | La tabla `usuarios` identifica las cuentas por ID y exige unicidad de correo y RUN |
| `pacientes` | Una mascota puede tener varias atenciones y vacunas. Una vacuna conserva la referencia al paciente y puede quedar vinculada a la atención donde se aplicó |
| `citas` | Cada cita referencia un servicio del catálogo y conserva el precio acordado. Cada pedido reúne sus líneas de detalle. Las restricciones impiden precios y existencias negativos |

Los identificadores compartidos entre esquemas, como el dueño de una mascota, se conservan como valores de referencia. Dentro de cada esquema sí hay claves foráneas, por ejemplo de `citas.citas.codigo_servicio` a `citas.catalogo_servicios`. Cada rol de aplicación recibe uso de su esquema, operaciones sobre sus tablas y acceso a las secuencias correspondientes.

## Inspeccionar la carga de demostración

En la raíz, abre una consola con `docker compose exec postgres psql -U postgres -d veterinaria`. Ejecuta estas consultas de lectura:

```sql
SELECT 'servicios' AS catalogo, count(*) AS cantidad FROM citas.catalogo_servicios
UNION ALL
SELECT 'productos', count(*) FROM citas.productos;

SELECT nombre, especie, id_dueno FROM pacientes.pacientes ORDER BY nombre;
```

En un volumen recién inicializado se esperan 31 servicios, 22 productos y dos mascotas, Luna y Michi, asociadas al dueño 3. Las fechas clínicas de demostración se calculan al crear el volumen. Sal de `psql` con `\q`.

## Volúmenes existentes

El volumen `postgres-data` conserva las tablas, los roles y los datos entre arranques. Editar estos scripts o las contraseñas de `.env` después de la inicialización requiere aplicar el cambio también a la base existente. Para conservar los datos, aplica una migración específica. Eliminar el volumen para repetir la carga inicial borra las mascotas, usuarios, citas y pedidos guardados.
