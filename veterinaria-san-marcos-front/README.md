# Frontend de Veterinaria San Marcos

Aplicación React 19 con Vite, React Router y Tailwind CSS. Desde la tienda se consultan productos y servicios, se arma un carrito y se registran pedidos. El área clínica permite gestionar mascotas, consultar atenciones y reservar citas. El panel muestra las operaciones disponibles según el rol de la sesión.

## Ejecutar en desarrollo

Para usar el proyecto completo con Docker sigue el [README principal](../README.md). Para desarrollar el front por separado, inicia primero el [backend](../veterinaria-san-marcos-back/README.md). Desde esta carpeta, con Node.js 24 (la versión de la imagen Docker) y npm, ejecuta:

```powershell
npm ci
npm run dev
```

Abre la dirección que imprime Vite, normalmente [localhost:5173](http://localhost:5173). Puedes comprobar la integración abriendo `/api/v1/productos` en esa misma dirección. Con el backend listo devuelve el catálogo en JSON.

## Cómo llegan las peticiones al backend

| Configuración | Función |
| --- | --- |
| `VITE_API_URL` | Base que usa el cliente HTTP. Su valor predeterminado es `/api/v1` |
| `API_PROXY_TARGET` | Destino del proxy de desarrollo para las rutas `/api`. Desde el host usa `http://localhost:9001` y Compose configura `http://ms-api-gateway:9001` |

Por ejemplo, el alta pública envía `POST /api/v1/auth/registro` y la creación de productos envía `POST /api/v1/productos` con la sesión del administrador. [El cliente HTTP](src/api/cliente.js) adjunta el token Bearer y convierte los errores del backend en mensajes para las vistas. Un 401 con token inicia el cierre de sesión. La sesión del navegador se guarda bajo `vet_sesion`.

## Pantallas y flujo de datos

| Recorrido | Rutas de la interfaz | Datos que intervienen |
| --- | --- | --- |
| Compra | `/catalogo`, `/carrito`, `/mis-pedidos` | El catálogo viene de la API. El carrito guarda la selección local y el backend calcula el importe del pedido |
| Atención del dueño | `/mascotas`, `/mascotas/:id`, `/citas/nueva`, `/mis-citas` | Fichas, historial y reservas del usuario autenticado |
| Recepción | `/recepcion/solicitudes`, `/recepcion/pacientes/:id`, `/recepcion/pedidos` | Gestión de solicitudes, ficha clínica y pedidos |
| Administración | `/admin`, `/admin/catalogo`, `/admin/reportes` | Gestión del catálogo y vistas de administración |

[App.jsx](src/App.jsx) define las rutas y responde a los cambios de sesión. Al recargar comprueba la identidad mediante `GET /auth/me`. [veterinaria.js](src/data/veterinaria.js) conecta los flujos clínicos con la API. Para seguir una compra, empieza en [compra.js](src/data/compra.js) y continúa en [pedidos.js](src/api/pedidos.js).

## Verificar una integración desde el navegador

1. Inicia el sistema y entra con el cliente de demostración del [README principal](../README.md).
2. Abre **Red / Network** en las herramientas de desarrollo y visita el catálogo. Busca la petición a `/api/v1/productos` y comprueba que la respuesta contiene códigos, precios y stock.
3. Para comprobar la escritura con datos de prueba, añade un producto disponible y confirma el carrito. Localiza `POST /api/v1/pedidos` y comprueba el pedido en `/mis-pedidos`. Confirmar la compra descuenta existencias.
4. Si falla, abre la respuesta de la petición. Un 409 puede indicar que se agotó el stock. Un 403 conserva la sesión y muestra el rechazo de la API. Un error de conexión requiere revisar Vite y el gateway.

El proxy se ejecuta donde corre Vite. Por eso `localhost:9001` sirve al ejecutar Vite en el host, mientras que el contenedor usa el nombre de servicio `ms-api-gateway:9001`.

## Estructura y comprobaciones

- [src/api](src/api) reúne el cliente HTTP y las operaciones de autenticación, usuarios, catálogos y pedidos.
- [src/features](src/features) agrupa citas, mascotas, clínica y panel. [src/layouts](src/layouts) contiene los diseños compartidos.
- `npm test` ejecuta Vitest. [vite.config.js](vite.config.js) enumera las pruebas antiguas de EP2 excluidas de esa ejecución.
- `npm run lint` revisa el código con Oxlint. `npm run build` genera el sitio en `dist/` y `npm run preview` permite revisar la compilación.

Al publicar `dist/` en un servidor estático, configura el reenvío de `/api` al gateway o define `VITE_API_URL` al compilar con una URL accesible desde el navegador.
