# Páginas de la clínica

- InicioPage presenta la clínica, los servicios destacados y accesos según el rol.
- ServiciosPage filtra y ordena serviciosCatalogo, la misma fuente del catálogo.
- ServicioCard comparte duración, precio CLP y enlace de solicitud entre ambas vistas.
- SolicitarCitaPage reconoce el parámetro servicio (código del catálogo) y lo
  preselecciona. El precio referencial se incorpora a la solicitud.
- UbicacionPage utiliza data/clinica.js. La dirección real elegida para la
  demostración es Plaza de los Héroes 445, Rancagua, correspondiente a la
  Municipalidad. No representa una sede real de la veterinaria.
- Las coordenadas señalan el entorno de la plaza como referencia aproximada. El
  enlace de Google Maps utiliza la dirección, para buscar las indicaciones desde
  la ubicación del usuario. No se pide geolocalización al cargar la página.
- MapaClinica carga Leaflet cuando se monta. Usa las teselas de OpenStreetMap,
  conserva su atribución visible y elimina mapa/observadores al desmontarse.
  Se necesita conexión a internet para cargar las teselas.
- MainLayout comparte la misma dirección con el Footer y Contacto. Teléfono, correo y horario permanecen sin
  completar hasta que el equipo defina esos datos.

La interfaz muestra la dirección configurada sin avisos académicos. Su procedencia
se conserva en esta documentación y data/clinica.js. Para cambiar el destino,
actualizar direccion y coordenadas. Si faltan datos válidos, se muestra solo el
mapa general de la ciudad y se ocultan las indicaciones de llegada.

Fuentes de la referencia real:
- https://rancagua.cl/?modulo=alcalde
- https://www.wikidata.org/wiki/Q6080269

Documentación del mapa:
- https://leafletjs.com/reference.html
- https://operations.osmfoundation.org/policies/tiles/
