# Microservicio de citas

Gestiona la agenda veterinaria y la tienda. Al reservar, consulta la ficha de la mascota en Pacientes y toma de ella el identificador del dueño. Una nueva cita queda en estado `SOLICITADA`. Si otra cita sin cancelar ya ocupa la misma fecha y hora de inicio, devuelve 409.

## API de agenda y tienda

Las rutas parten de `/api/v1`. Las lecturas de productos y servicios son públicas. El resto requiere un JWT.

| Recurso | Operaciones |
| --- | --- |
| `/citas` | Listar y reservar en la colección. Consultar o eliminar por ID. Cambiar estado con `PATCH /{id}/estado` y reprogramar con `PATCH /{id}/reprogramar` |
| `/servicios` | Listar y consultar por código. Administración puede crear, editar y eliminar servicios |
| `/productos` | Listar y consultar por código. Administración puede crear, editar, eliminar y ajustar existencias mediante `PATCH /{codigo}/stock` |
| `/pedidos` | Crear un pedido, consultar `/mios` o leer el detalle por ID. Administración y recepción pueden listar todos. El estado se cambia en `PATCH /{id}/estado` |

Un dueño puede cancelar sus propias citas. Recepción y administración pueden reprogramar citas activas. La eliminación de citas requiere el rol de administrador.

## Ciclo de un pedido

Al crear el pedido se comprueban las existencias y se descuenta la cantidad de cada producto. Si el stock es insuficiente, la API responde con 409. Un pedido `PENDIENTE` puede confirmarse o cancelarse. Uno `CONFIRMADO` puede entregarse o cancelarse. La cancelación repone las unidades de productos. Solo administración puede eliminar un pedido y debe estar cancelado.

## Solicitud de hora

| Campo de `POST /api/v1/citas` | Qué enviar |
| --- | --- |
| `idPaciente` | ID de una ficha accesible para quien reserva |
| `codigoServicio` | Código de un servicio activo que admita la especie de la mascota |
| `fecha`, `hora` | Fecha en formato `AAAA-MM-DD` y un turno disponible. Los inicios admitidos son 09:00, 10:00, 11:00, 12:00, 15:00, 16:00 y 17:00 |
| `motivo` | Texto opcional de hasta 500 caracteres |

El servicio guarda el precio acordado y la duración de la prestación en la cita. Para revisar las reservas activas de una mascota se puede consultar `GET /api/v1/citas?idPaciente={id}&activas=true`.

## Ejemplo de pedido de prueba

Con la [sesión de dueño](../ms-usuarios/README.md), el siguiente ejemplo compra una unidad del producto de demostración `ME001`. Requiere que el producto esté activo y tenga existencias. Ejecutarlo crea un pedido real en la base local.

```powershell
$compra = @{ items = @(@{ tipo = 'PRODUCTO'; codigo = 'ME001'; cantidad = 1 }) }
$pedido = Invoke-RestMethod -Method Post -Uri "$api/pedidos" -Headers $cabeceras -ContentType 'application/json' -Body ($compra | ConvertTo-Json -Depth 4)
Invoke-RestMethod -Uri "$api/pedidos/$($pedido.id)" -Headers $cabeceras
```

Cada línea acepta `PRODUCTO` o `SERVICIO` y una cantidad de 1 a 99. El servidor recupera el precio del catálogo y guarda nombre, precio y cantidad en el detalle. Para productos, el bloqueo de la fila protege la actualización del stock mientras se registra la compra.

## Ejecución y verificación

En Compose escucha en el puerto interno `9003` y accede al esquema `citas` como `app_citas` con `DB_CITAS_PASSWORD`. Sigue la [guía del backend](../README.md) para levantar las dependencias y el gateway. El contrato con los campos de cada solicitud y respuesta está disponible en [OpenAPI de citas](http://localhost:9001/openapi/citas).

Desde la carpeta del backend puedes ejecutar las pruebas del módulo con `mvn -pl ms-citas -am test`.
