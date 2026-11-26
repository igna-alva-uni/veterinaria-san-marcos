# Guía de defensa técnica individual (EP3)

Para cada indicador: qué archivo abrir, qué mostrar y cómo explicarlo con tus palabras. El docente puede pedir que muestres código o ejecutes una operación, así que practica los recorridos con el proyecto levantado.

---

## IE3.1.2 · Backend, persistencia, modelos y lógica de negocio (12%)

**Recorrido recomendado (catálogo y pedidos):**
1. `ms-citas/.../entity/Producto.java` → tabla `citas.productos`, `@Id codigo`, `stock`, `precio` (`BigDecimal`, porque es `NUMERIC(12,0)`).
2. `repository/ProductoRepository.java` → Spring Data genera las consultas; `bloquearPorCodigo` usa `@Lock(PESSIMISTIC_WRITE)` (SELECT … FOR UPDATE).
3. `service/PedidoService.java → crear` → agrupa ítems, toma el precio desde la base, valida y descuenta stock, calcula totales. Todo en un `@Transactional`: si un ítem falla, se hace rollback y el stock no cambia.
4. `controller/PedidoController.java` → expone `POST /api/v1/pedidos`.

**Preguntas probables**
- *¿Por qué el precio no viene del frontend?* Porque se puede manipular en el navegador; el backend usa el precio de la base y guarda una copia en `pedido_detalle` para que el pedido no cambie si después se edita el catálogo.
- *¿Qué pasa si dos personas compran la última unidad al mismo tiempo?* La segunda espera el bloqueo de la fila, ve stock 0 y recibe 409.
- *¿Por qué `ddl-auto: none`?* El esquema lo definen los scripts SQL (`init-multi-db`); Hibernate no debe modificarlo. Con `JPA_DDL_AUTO=validate` se contrasta.
- *¿Por qué no hay FK entre `pacientes.id_dueno` y `usuarios`?* Cada microservicio es dueño de su esquema; la relación se valida por API (Feign), no por la base.
- *¿Para qué sirven los DTO?* Para no exponer la entidad (por ejemplo, la contraseña del usuario) y validar la entrada con Bean Validation.

## IE3.2.3 · API REST, CRUD y Swagger (12%)

**Mostrar en Swagger (http://localhost:9001/swagger-ui.html):** seleccionar «Citas», sección *Productos*.

| Operación | Método y ruta | Entrada | Respuesta |
| --- | --- | --- | --- |
| Leer | `GET /api/v1/productos` | — (público) | 200 lista |
| Crear | `POST /api/v1/productos` | JSON `ProductoRequest` | 201 / 400 validación / 409 código duplicado / 403 si no es admin |
| Actualizar | `PUT /api/v1/productos/{codigo}` | JSON | 200 / 404 |
| Stock | `PATCH /api/v1/productos/{codigo}/stock` | `{ "stock": 10 }` | 200 |
| Eliminar | `DELETE /api/v1/productos/{codigo}` | — | 204 eliminado / 200 desactivado si tiene ventas |

**Manejo de errores:** `GlobalExceptionHandler` (ms-commons) convierte excepciones en `ErrorResponse` con `status`, `mensaje` y `ruta`. Las reglas de negocio lanzan `ApiException` con el código HTTP adecuado.

**Preguntas probables**
- *¿Diferencia entre PUT y PATCH?* PUT reemplaza el recurso completo; PATCH cambia una parte (stock, estado).
- *¿Por qué DELETE a veces devuelve 200?* Porque si el producto ya aparece en pedidos se desactiva para no romper el historial (eliminación lógica) e informamos al cliente.
- *¿Cómo se documenta?* springdoc genera el OpenAPI desde los controladores y las anotaciones `@Operation` y `@Tag`; el gateway junta los tres documentos.

## IE3.2.4 · Flujo de integración frontend/backend (10%)

**Recorrido «Confirmar pedido»:**
1. `CarritoPage.jsx → confirmarPedido` (estado `enviando`).
2. `api/pedidos.js → confirmarPedido` arma `{ cliente, items: [{tipo, codigo, cantidad}] }`.
3. `api/cliente.js → api()` hace `fetch('/api/v1/pedidos')` con `Authorization: Bearer`.
4. Vite reenvía `/api` al gateway (`vite.config.js`), el gateway enruta a `ms-citas` (`ms-api-gateway/application.yml`).
5. Respuesta 201 → `pedidoDesdeApi` → `setPedidoRealizado` y `setPaso('completado')`; se recarga el catálogo para ver el stock nuevo.
6. Si responde 409 → `ApiError` → `setMensaje(error.message)` y se recarga el catálogo.

**Preguntas probables**
- *¿Dónde se actualiza el estado?* En la vista, con `setState` después de la respuesta (por ejemplo `setPedidoRealizado`, `setMascotas`).
- *¿Por qué un proxy en Vite?* El navegador llama al mismo origen (5173) y no necesita CORS; en producción se usaría el mismo dominio o CORS en el gateway (ya configurado).
- *¿Qué pasa si el backend está caído?* `api()` lanza `ApiError(0, 'No se pudo conectar…')` y la vista lo muestra.

## IE3.3.4 · JWT, roles y autorización (10%)

- **Se crea:** `ms-commons/.../JwtService.generar`, llamado desde `ms-usuarios/.../AuthService.login` tras validar `BCrypt` y que la cuenta esté activa.
- **Contenido:** `sub` (id), `email`, `nombre`, `rol`, `iss`, `iat`, `exp`. Firmado HS256 con `JWT_SECRET`.
- **Se valida:** `JwtAuthenticationFilter` (cada petición, en cada microservicio) → firma, emisor y expiración. Si es válido, crea la autenticación con `ROLE_<rol>`.
- **Se verifica el rol:** `@PreAuthorize("hasRole('ADMINISTRADOR')")` y reglas de propiedad en los servicios (por ejemplo `PacienteService.buscarVisible`).
- **401 vs 403:** 401 = no autenticado o token vencido/alterado; 403 = autenticado pero sin permiso.

**Preguntas probables**
- *¿Por qué validar en el backend si el frontend ya oculta la vista?* Porque la API se puede llamar directamente (Swagger, Postman, consola). Demostración: token de cliente en Swagger → `GET /api/v1/usuarios` → 403.
- *¿Cómo valida ms-citas un token que emitió ms-usuarios?* Comparten la clave `JWT_SECRET`; no necesitan consultarse.
- *¿Por qué `STATELESS` y sin CSRF?* No hay sesión en el servidor ni cookies: el token viaja en un encabezado que otro sitio no puede adjuntar automáticamente.
- *Limitación:* un token no se puede revocar antes de vencer; mejora posible: refresh tokens o lista de revocación.

## IE3.3.5 · Gestión y persistencia de sesión (8%)

- `api/sesion.js → guardarSesion`: guarda `{ token, expiraEn, usuario }` en `localStorage['vet_sesion']`, sin contraseña.
- **Recarga:** `App.jsx` inicializa `sesion` con `leerSesion()` (descarta si venció) y confirma con `GET /api/v1/auth/me`.
- **Expiración:** temporizador hasta `expiraEn` → `notificarSesionExpirada` → evento `vet:sesion-expirada` → `App` limpia estado y navega a `/login` con mensaje.
- **Token inválido:** cualquier 401 con sesión iniciada (en `api/cliente.js`) produce el mismo cierre.
- **Demostración:** F5 (se mantiene), editar el token en Local Storage y recargar (vuelve al login).
- *Mejora posible:* cookie `HttpOnly` para reducir el riesgo de XSS.

## IE3.3.6 · Control de acceso a interfaces y acciones (8%)

- **Rutas:** `components/ProtectedRoute.jsx` (sin sesión → `/login`; rol no permitido → «Acceso denegado»). En `App.jsx`: `/mascotas` solo Dueño; `/recepcion/*` Recepcionista y Administrador; `/admin/*` Administrador.
- **Menú:** `enlaces` en `App.jsx` cambia según el rol.
- **Acciones:** botones condicionados al estado y al rol (por ejemplo «Cancelar pedido» solo si está pendiente; acciones de `GestionPedidosPage` según `ACCIONES`).
- **Backend:** las mismas reglas están en `@PreAuthorize` y en los servicios; la interfaz es comodidad, el backend es la seguridad.

---

## Lo que hizo cada integrante

Completar con lo que cada uno implementó y puede explicar en detalle (el docente pregunta sobre la participación técnica real):

| Integrante | Partes principales |
| --- | --- |
| Luis | Catálogo y carrito: `ms-citas` (productos, pedidos, `CatalogoService`, `PedidoService`), `CatalogoPage`, `CarritoPage`, `MisPedidosPage`, `GestionCatalogoPage`, `GestionPedidosPage`, `api/catalogo.js`, `api/pedidos.js` |
| Daniel More | |
| Ignacio Álvarez | |
