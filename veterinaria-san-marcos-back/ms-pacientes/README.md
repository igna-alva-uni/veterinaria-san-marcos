# Microservicio de pacientes

Mantiene las fichas de mascotas, sus atenciones clínicas y el historial de vacunas. Un dueño ve sus propias mascotas y las nuevas fichas que registra quedan asociadas a su identidad. El personal puede consultar las mascotas de un cliente mediante el filtro `idDueno`.

## API clínica

Todas las rutas parten de `/api/v1/pacientes` y requieren un JWT. La ruta base representa la colección de mascotas.

| Método y ruta relativa | Uso |
| --- | --- |
| `GET` en la base, `GET /{id}` | Listar fichas o consultar una mascota dentro del alcance del usuario |
| `POST` en la base, `PUT /{id}` | Registrar una mascota o actualizar su ficha |
| `PATCH /{id}/observaciones` | Actualizar anotaciones como administrador, recepcionista o veterinario |
| `GET /{id}/atenciones` | Consultar las atenciones de una mascota accesible al usuario |
| `POST /{id}/atenciones`, `DELETE /{id}/atenciones/{idAtencion}` | Registrar o retirar una atención como administrador, recepcionista o veterinario |
| `DELETE /{id}` | Eliminar una mascota después de verificar acceso y citas activas |

Para eliminar una ficha, el servicio consulta a Citas mediante OpenFeign. Si encuentra una cita activa, responde con 409. La cancelación de la cita se gestiona en [ms-citas](../ms-citas/README.md).

## Campos de la ficha clínica

| Campo de entrada | Regla |
| --- | --- |
| `nombre`, `especie` | Obligatorios. El nombre admite hasta 50 caracteres. Las especies aceptadas son `Perro`, `Gato`, `Conejo`, `Ave` y `Otro` |
| `edad` o `fechaNacimiento` | Para crear la ficha se informa uno de los dos. La edad admite de 0 a 40 años. La fecha tiene prioridad si se envían ambos valores |
| `pesoKg` | Opcional, de 0,01 a 999,99 kg |
| `idDueno` | El personal indica el dueño. Para una sesión de dueño se utiliza el ID del token |

La respuesta incluye `duenoId`, la edad calculada y la lista `historial`. Al registrar una atención se exige diagnóstico y una fecha igual o anterior a hoy. Si se incluye una vacuna, su vencimiento debe ser posterior a la fecha de aplicación.

## Registrar y consultar una mascota de prueba

Obtén `$api` y `$cabeceras` con el [ejemplo de inicio de sesión](../ms-usuarios/README.md). Este bloque crea una ficha con la cuenta de dueño y consulta el historial mediante el ID devuelto.

```powershell
$ficha = @{ nombre = 'Nube'; especie = 'Gato'; edad = 2; pesoKg = 4.3 }
$mascota = Invoke-RestMethod -Method Post -Uri "$api/pacientes" -Headers $cabeceras -ContentType 'application/json' -Body ($ficha | ConvertTo-Json)
Invoke-RestMethod -Uri "$api/pacientes/$($mascota.id)/atenciones" -Headers $cabeceras
```

El historial de una ficha recién creada estará vacío. La ficha, las atenciones y las vacunas corresponden a tablas distintas del [esquema pacientes](../init-multi-db/02-pacientes.sql).

## Ejecución y verificación

En Compose escucha en el puerto interno `9004` y accede al esquema `pacientes` como `app_pacientes` con `DB_PACIENTES_PASSWORD`. Sigue la [guía del backend](../README.md) para levantar las dependencias y el gateway. El contrato con los campos de cada solicitud y respuesta está disponible en [OpenAPI de pacientes](http://localhost:9001/openapi/pacientes).

Desde la carpeta del backend puedes ejecutar las pruebas del módulo con `mvn -pl ms-pacientes -am test`.
