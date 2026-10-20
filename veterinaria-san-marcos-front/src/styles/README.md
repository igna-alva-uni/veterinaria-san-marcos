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

Los estilos del módulo integrado se limitan a `.vet-module` en App.css. Las
rejillas y tablas usan utilidades Tailwind; no se importa Bootstrap.
