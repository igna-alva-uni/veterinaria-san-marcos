# Portadas de administración y recepción

PanelPage se renderiza en /admin y /recepcion dentro de DashboardLayout y
MainLayout. Usa tipo="admin" o tipo="recepcion" y recibe usuario, usuarios y
pacientes desde App. ProtectedRoute mantiene las restricciones por rol.

El ingreso lleva al panel correspondiente. El navbar ofrece Administración y
Recepción; las pantallas de gestión siguen disponibles en sus rutas anteriores.
El enlace Resumen del panel del layout permite volver a la portada.

Los indicadores se calculan en data/panel.js:
- Administración: usuarios activos, pacientes, solicitudes pendientes y atenciones.
- Recepción: solicitudes pendientes, citas de hoy, confirmadas hoy y pacientes.
- La agenda muestra hasta cinco próximas citas no canceladas, ordenadas por fecha
  y hora. Los datos del paciente se obtienen del registro compartido.

useSyncExternalStore escucha vet:citas y storage para actualizar el resumen.
Las operaciones de citas emiten vet:citas después de guardar correctamente.
La fecha del día se calcula en hora local. No se generan registros de ejemplo
para llenar las tarjetas ni el estado vacío.

La eliminación de los avisos académicos es un cambio de presentación: los datos
continúan persistiendo en localStorage y el backend sigue pendiente de integrar.
