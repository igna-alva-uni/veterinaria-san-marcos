# Guion del video demostrativo (EP3)

Duración objetivo: 10 minutos. Grabar pantalla con audio; mostrar el sistema funcionando, no diapositivas.

**Antes de grabar**
- En `.env` poner `JWT_EXPIRATION_MINUTES=2` (solo para el video) y levantar con `docker compose up --build -d` sobre un volumen limpio (`docker compose down --volumes` primero).
- Tener abiertos: el navegador con DevTools (pestañas *Red* y *Aplicación → Local Storage*), Swagger, Eureka, el IDE con el backend y una terminal con `psql`.
- No mostrar el `.env` ni el token completo (recortar o difuminar en la edición).
- Comprobar que el enlace del video se abre sin pedir permisos.

| Tiempo | Bloque | Quién | Qué mostrar y decir |
| --- | --- | --- | --- |
| 0:00–0:45 | Inicio | Integrante 1 | Nombre del proyecto, integrantes y diagrama de arquitectura (`docs/INTEGRACION.md` §1): React → Gateway → 3 microservicios → PostgreSQL, Eureka y JWT. |
| 0:45–2:15 | Backend y BD | Integrante 2 | `docker compose ps`; Eureka con los 3 servicios; en el IDE recorrer `Producto` → `ProductoRepository` → `CatalogoService` → `ProductoController`; en `psql`: `SELECT codigo_producto, stock FROM citas.productos LIMIT 5;`. Mencionar una regla de negocio (stock con bloqueo de fila). |
| 2:15–3:45 | Swagger y CRUD | Integrante 2 | Swagger del gateway → `POST /auth/login` (admin) → *Authorize* → en Productos: `POST` crear `ME023`, `GET` verlo, `PUT` cambiar precio, `DELETE` (204). Mostrar un error de validación (400) y uno de duplicado (409). |
| 3:45–5:30 | Integración React–REST | Integrante 3 | Como cliente: catálogo → agregar al carrito → confirmar pedido. En *Red* mostrar `POST /api/v1/pedidos`, el encabezado `Authorization: Bearer …` y la respuesta 201. Volver al catálogo: el stock bajó. En `psql` mostrar el pedido en `citas.pedidos`. |
| 5:30–7:30 | JWT y roles | Integrante 1 | Login como cliente y mostrar `vet_sesion` (token, expiración, sin contraseña). Abrir `/admin/usuarios` → «Acceso denegado». En Swagger con token de cliente: `GET /api/v1/usuarios` → **403**; sin token: `GET /api/v1/pacientes` → **401**. Login como recepción: ve solicitudes y confirma la cita del cliente. Mostrar `JwtAuthenticationFilter` y un `@PreAuthorize`. |
| 7:30–9:15 | Sesiones y restricciones | Integrante 3 | Recargar (F5): la sesión se mantiene y se ve `GET /auth/me` 200. Esperar la expiración (2 min) o editar el token en Local Storage → vuelve al login con «Tu sesión expiró…». Cerrar sesión. Mostrar una acción restringida en el backend: en Swagger, con token de cliente, `PATCH /api/v1/pedidos/{id}/estado` con `CONFIRMADO` → 403 «Solo puedes cancelar tus pedidos mientras estén pendientes.». |
| 9:15–10:00 | Cierre | Todos | Resumen de lo demostrado, enlaces a los repositorios y a `docs/`. |

**Lista de comprobación final**
- [ ] Se ven frontend, backend y base de datos funcionando.
- [ ] CRUD completo y Swagger.
- [ ] Flujo frontend → API → BD con la petición visible.
- [ ] JWT, 401, 403, persistencia al recargar y expiración.
- [ ] Audio claro; código legible; sin secretos visibles.
- [ ] Enlace registrado en la entrega individual de AVA.

Volver a `JWT_EXPIRATION_MINUTES=60` después de grabar.
