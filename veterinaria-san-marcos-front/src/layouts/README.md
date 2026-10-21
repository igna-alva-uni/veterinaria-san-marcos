# Layouts y rutas compartidas

Un layout organiza la presentación común de varias páginas. La página concreta se
renderiza en `Outlet`, según la ruta seleccionada por React Router.

## MainLayout

Contiene Header, un único main accesible y Footer. Recibe `navigation`, `user`,
`onLogin`, `onLogout` y `message` desde App. Lee `pathname` con `useLocation` y lo
pasa al Header para marcar el enlace activo. Las páginas comunes, módulos de
mascotas, citas, catálogo y paneles se muestran en su Outlet.

## AuthLayout

Contiene el main centrado y el contenedor de formularios para `/login` y
`/registro`. Muestra los mensajes y el Outlet. No incluye Header ni Footer.
Los datos y acciones de autenticación siguen en App; el layout solo presenta.

## DashboardLayout

Se utiliza para recepción y administración, dentro de MainLayout. Añade el rótulo
`Panel de recepción` o `Panel de administración`, recibido mediante `title`, y su
Outlet. No agrega otro main, Header ni Footer. Es la estructura compartida del
panel, no una página nueva de estadísticas.

## ContentLayout

Mantiene los estilos de las ramas integradas separados. Por defecto envuelve la
página con `.vet-module`; con `variant="feature"` utiliza `.feature-module`.
Así se evita aplicar los estilos de formularios antiguos a las páginas nuevas.
Las rutas declaran esta variante explícitamente; ya no se deduce mediante regex
sobre la URL en App.

## ProtectedRoute

Está en `../components/ProtectedRoute.jsx`. Recibe `user` y `roles`:

- Sin sesión redirige a `/login` con Navigate y replace.
- Con un rol no permitido muestra Acceso denegado.
- Con un rol permitido renderiza Outlet para continuar hacia las rutas hijas.

La protección se aplica a grupos de rutas, separada de los layouts visuales.
Recepción admite Administrador y Recepcionista; administración solo Administrador;
la gestión del dueño admite Dueño. Las vistas generales requieren sesión.
La autorización sigue siendo una simulación frontend; el backend debe verificar
su propia autenticación y permisos.

## Rutas anidadas en App

Una Route sin path agrupa rutas bajo un layout o una protección sin cambiar sus
URLs. Por ejemplo:

```jsx
<Route element={<ProtectedRoute user={sesion} roles={['Administrador']} />}>
  <Route element={<DashboardLayout title="Panel de administración" />}>
    <Route element={<ContentLayout />}>
      <Route path="/admin/usuarios" element={<Usuarios {...props} />} />
    </Route>
  </Route>
</Route>
```

En este ejemplo, la protección decide el acceso, DashboardLayout presenta el panel,
ContentLayout aplica los estilos y Usuarios muestra la página. MainLayout envuelve
este grupo en la configuración real, aportando Header, main y Footer.

App conserva usuarios, pacientes, sesión y acciones. Se retiraron los booleanos
que detectaban login o módulos por la URL, y la función acceso repetida en cada
ruta. Las rutas, sus redirecciones y la página 404 conservan sus URLs anteriores.

## Agregar una página

1. Crear el componente de página.
2. Declarar su Route dentro del grupo de permisos correspondiente.
3. Elegir ContentLayout normal o feature según los estilos que utiliza.
4. Agregar el enlace al navbar si corresponde al rol.

La página no debe repetir Header, Footer ni main: sus layouts ya los proporcionan.

## Verificación

App.test.jsx comprueba login/registro sin Header/Footer, paneles con un solo main,
una sola cabecera y un solo pie, acceso por rol, redirecciones y la página 404.
Las demás pruebas de navegación, formularios, carrito y datos siguen vigentes.
