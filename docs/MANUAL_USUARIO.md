# Manual de usuario · Veterinaria San Marcos

Versión EP3 · DSY1104 Desarrollo Fullstack II

> **Para completar antes de entregar:** cada recuadro «📷 Captura» indica qué pantalla capturar. Usar las cuentas de demostración y no mostrar contraseñas reales ni el token completo.

## 1. Acceso al sistema

Dirección: http://localhost:5173 (con el proyecto levantado según el README).

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@duocuc.cl` | `Admin12345` |
| Recepcionista | `recepcion@gmail.com` | `Recepcion123` |
| Dueño de mascota | `cliente@profesor.duoc.cl` | `Cliente123` |

### 1.1 Iniciar sesión
1. Escribir el correo y la contraseña.
2. Presionar **Ingresar**. El sistema lleva a cada rol a su página principal: el dueño a *Inicio*, la recepción a *Panel de recepción* y la administración a *Panel de administración*.
3. Si los datos no son correctos aparece «Credenciales inválidas o usuario desactivado».

> 📷 **Captura 1:** pantalla de inicio de sesión.
> 📷 **Captura 2:** mensaje de credenciales inválidas.

### 1.2 Crear una cuenta (dueños de mascotas)
1. En el login, elegir **Regístrate**.
2. Completar RUN (con dígito verificador, ej. `12345678-5`), nombre, apellido, correo terminado en `@profesor.duoc.cl`, teléfono (opcional) y contraseña de al menos 8 caracteres.
3. Presionar **Crear cuenta** y luego iniciar sesión.

> 📷 **Captura 3:** formulario de registro completo.

### 1.3 Sesión
- La sesión se mantiene al recargar la página.
- Por seguridad, la sesión vence automáticamente (60 minutos por defecto). El sistema vuelve al login con el mensaje «Tu sesión expiró. Inicia sesión nuevamente.».
- Para salir, usar **Cerrar sesión** en la barra superior.

> 📷 **Captura 4:** login mostrando el mensaje de sesión expirada.

## 2. Dueño de mascota

### 2.1 Inicio
Muestra accesos rápidos, servicios destacados y **Avisos de vacunas** vencidas o por vencer en los próximos 30 días.

> 📷 **Captura 5:** inicio del dueño con el aviso de vacuna de Michi.

### 2.2 Mis mascotas
1. Menú **Mis mascotas** → **+ Registrar mascota**.
2. Completar nombre, especie, raza, edad y sexo → **Guardar mascota**.
3. **Ver ficha de mascota** permite editar los datos, eliminar la mascota (si no tiene citas activas) y revisar su historial clínico y vacunas.

> 📷 **Captura 6:** listado de mascotas.
> 📷 **Captura 7:** ficha de una mascota con su historial.

### 2.3 Solicitar y revisar citas
1. Menú **Solicitar cita**: elegir mascota, servicio, fecha, horario y motivo → **Solicitar cita**.
2. Si el horario ya está tomado o el servicio no corresponde a la especie, el sistema lo informa.
3. Menú **Mis citas**: lista de solicitudes con su estado (Pendiente de confirmación, Confirmada, Cancelada). Desde aquí se puede **Cancelar** una cita activa o **Ver detalle**.

> 📷 **Captura 8:** formulario de solicitud de cita.
> 📷 **Captura 9:** Mis citas con estados.

### 2.4 Tienda: catálogo, carrito y pedidos
1. Menú **Catálogo**: buscar, filtrar por categoría o tipo y ordenar. Cada producto muestra su stock.
2. **Agregar al carrito**. No se pueden agregar más unidades que el stock disponible.
3. Menú **Carrito**: ajustar cantidades o eliminar elementos → **Finalizar compra** → completar los datos de contacto → **Confirmar pedido**.
4. Se muestra el número de pedido (por ejemplo `VSM-26112514301207`) y el total calculado por el sistema.
5. Menú **Mis pedidos**: estado de cada pedido. Un pedido pendiente se puede cancelar; el stock se libera.

> 📷 **Captura 10:** catálogo con filtros.
> 📷 **Captura 11:** carrito con productos y servicios.
> 📷 **Captura 12:** confirmación del pedido.
> 📷 **Captura 13:** Mis pedidos.

### 2.5 Mi perfil
Permite actualizar nombre, apellido y teléfono. El correo y el RUN solo los cambia administración.

## 3. Recepción

### 3.1 Panel de recepción
Indicadores (solicitudes pendientes, citas de hoy, pacientes) y próximas citas.

> 📷 **Captura 14:** panel de recepción.

### 3.2 Solicitudes de citas
- **Confirmar** o **Cancelar** cada solicitud.
- **Reprogramar**: elegir nueva fecha y horario; la cita vuelve a quedar pendiente de confirmación.

> 📷 **Captura 15:** solicitudes con las acciones.

### 3.3 Pacientes y ficha clínica
1. **Pacientes**: registrar una mascota indicando su dueño, editar nombre, especie y edad en la tabla, o eliminarla.
2. **Ver ficha**: guardar antecedentes generales y registrar atenciones (fecha, servicio, diagnóstico, medicamento, indicaciones, próximo control y, si corresponde, la vacuna aplicada con su vencimiento).

> 📷 **Captura 16:** gestión de pacientes.
> 📷 **Captura 17:** registro de una atención con vacuna.

### 3.4 Pedidos de la tienda
Lista todos los pedidos con filtro por estado. Acciones: **Confirmar**, **Marcar entregado** o **Cancelar** (devuelve el stock).

> 📷 **Captura 18:** gestión de pedidos.

## 4. Administración

Incluye todo lo de recepción, además de:

### 4.1 Gestión de usuarios
- **Crear usuario**: RUN, nombre, apellido, rol, correo (con el dominio del rol), teléfono y contraseña.
- **Editar usuario**, **Activar/Desactivar** (una cuenta desactivada no puede ingresar) y **Eliminar cliente** (solo dueños sin mascotas).
- El administrador no puede cambiar su propio rol ni desactivarse.

> 📷 **Captura 19:** listado y formulario de usuarios.

### 4.2 Catálogo de la tienda
1. Elegir **Productos** o **Servicios**.
2. **Nuevo producto/servicio**: código (`ME###` o `SV###`), nombre, categoría, especie, stock o duración, precio y visibilidad.
3. **Editar** o **Eliminar**. Si el elemento ya se vendió o tiene citas, el sistema lo desactiva en lugar de borrarlo para conservar el historial.

> 📷 **Captura 20:** catálogo de administración con el formulario abierto.

### 4.3 Reportes
Atenciones registradas filtradas por rango de fechas.

## 5. Mensajes frecuentes

| Mensaje | Significado |
| --- | --- |
| Acceso denegado: tu rol no tiene permiso para esta vista. | La página es de otro rol. |
| Tu rol no tiene permiso para realizar esta acción. | El servidor rechazó la operación (403). |
| Tu sesión expiró. Inicia sesión nuevamente. | El token venció o no es válido. |
| No se pudo conectar con el servidor… | El backend no está levantado. |
| Stock insuficiente para … Disponible: N. | Otra compra tomó el stock; el carrito se actualiza. |
| Ese horario ya tiene una solicitud activa. | Elegir otro horario. |
