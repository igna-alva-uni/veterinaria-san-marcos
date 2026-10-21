# Estilos y componentes compartidos

`theme.css` define la paleta, las fuentes, los bordes y las sombras. `layout.css`
contiene los estilos del Header, Footer y contenedor principal. Ambos se importan
desde `index.css`, por lo que los componentes no deben volver a importar Tailwind.

## Header

`navigation.js` contiene los enlaces comunes. El Header acepta:

- `navigation`: lista de objetos `{ label, href }`. El layout puede pasar los
  enlaces permitidos para el rol actual, incluyendo recepción o administración.
- `activePath`: ruta actual para marcar el enlace activo. App pasa
  `location.pathname` obtenido con React Router.
- `user`: usuario de la sesión con la propiedad `name`.
- `onLogin` y `onLogout`: acciones proporcionadas por el módulo de autenticación.
  Los botones correspondientes aparecen únicamente cuando tienen una acción.

Los enlaces internos usan `Link` de React Router. Header, Footer y Brand deben
renderizarse dentro de `BrowserRouter`. App conecta la sesión simulada con el
Header y filtra los enlaces según el rol. Login y registro usan una presentación
sin Header ni Footer; las demás vistas comparten ambos componentes.

Las rutas del módulo comprueban la sesión y el rol. Filtrar enlaces no sustituye
la autorización del backend: la autenticación actual sigue siendo una simulación
local para EP2. Inicio, Servicios y Ubicación tienen contenido inicial para evitar
enlaces rotos, pendiente de completar con las páginas definitivas del equipo.

El menú se colapsa hasta 960 px, se abre mediante un botón y se cierra con Escape
o al seleccionar un enlace. Escape devuelve el foco al botón del menú.

## Footer

Acepta `navigation` y un objeto `contact` con `address`, `phone`, `email` y `hours`.
Los datos de contacto opcionales se muestran cuando se proporcionan. Sin dirección
exacta se muestra únicamente la ciudad y la región del caso académico.

## Layout

El contenido entre Header y Footer debe usar un elemento `main` con
`id="contenido"`, `tabIndex={-1}` y las clases `site-container site-main` para que
funcionen el enlace de salto, el ancho compartido y el pie al final de la pantalla.
`MainLayout` ya proporciona este elemento; las páginas hijas no deben repetirlo.
`AuthLayout` proporciona su propio main para login y registro. `DashboardLayout`
se anida dentro de MainLayout para los paneles de recepción y administración.
La jerarquía de rutas y los permisos se explican en [la guía de layouts](../layouts/README.md).

Los estilos del módulo integrado se limitan a `.vet-module` en App.css. Las
rejillas y tablas usan utilidades Tailwind; no se importa Bootstrap.

## Integración de mascotas, citas y compras

Las rutas `/mascotas`, `/mascotas/:id` y `/citas/nueva` son para dueños.
`/mis-citas` y su detalle requieren sesión; los dueños solo ven sus solicitudes.
Recepción y administración gestionan todas en `/recepcion/solicitudes`.
`/catalogo` y `/carrito` requieren sesión. Todas usan el Header y Footer comunes;
el Navbar alternativo de la rama no se monta.

`data/veterinaria.js` utiliza `vet_pacientes`, la misma fuente que recepción.
Al registrar o editar desde las páginas de mascotas, emite `vet:pacientes` para
sincronizar el estado de App. Conserva el historial clínico y el identificador del
propietario. Las citas se guardan en `vsm-citas` con su `duenoId` y se filtran al leer.

Los registros heredados de demostración sin propietario se reservan al cliente
semilla de id 3; no se asignan al usuario que abra la aplicación. La migración de
`vsm-mascotas` conserva los pacientes existentes y agrega los identificadores
faltantes una sola vez.

`data/catalogo.js` es el catálogo compartido. `catalogo.js` conserva exportaciones
compatibles para la ficha clínica. El carrito y los pedidos usan claves por cuenta:
`vsm-carrito:<id>` y `vsm-pedidos:<id>`. Los datos de compra heredados se reservan
al cliente semilla. Un servicio tiene una unidad; los productos respetan el stock
referencial. El pedido es una demostración local, sin pagos ni despacho real.

Las páginas nuevas usan `.feature-module` para conservar su CSS propio sin recibir
los estilos de formularios de `.vet-module`. Sus elementos raíz son contenedores,
para mantener un solo `main` en el documento.
