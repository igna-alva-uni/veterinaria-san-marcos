# Microservicio de usuarios

Gestiona cuentas, perfiles y acceso al sistema. El registro público crea una cuenta de rol `DUENO` y exige correo del dominio `profesor.duoc.cl`. El servicio comprueba la unicidad del correo y del RUN. Para iniciar sesión verifica que la cuenta esté activa y compara la contraseña con el hash BCrypt antes de emitir el JWT.

## API de identidad y usuarios

Todas las rutas parten de `/api/v1`.

| Método y ruta | Uso |
| --- | --- |
| `POST /auth/registro`, `POST /auth/login` | Registro e inicio de sesión públicos |
| `GET /auth/me`, `PUT /usuarios/me` | Consultar la identidad y editar el perfil con el token de la sesión |
| `GET /usuarios`, `GET /usuarios/{id}` | Listado para administración, recepción y veterinarios. Consulta individual sujeta a permisos |
| `POST /usuarios`, `PUT /usuarios/{id}` | Crear y editar cuentas como administrador |
| `PATCH /usuarios/{id}/estado`, `DELETE /usuarios/{id}` | Activar o desactivar una cuenta y eliminar clientes como administrador |

La cuenta que ejecuta la operación no puede desactivarse ni eliminarse a sí misma. Antes de borrar un cliente, Usuarios consulta a Pacientes mediante OpenFeign. Si el cliente tiene mascotas, la API devuelve un conflicto (409).

## Datos y reglas de registro

| Campo o rol | Regla |
| --- | --- |
| RUN | Se normaliza y se valida el dígito verificador chileno mediante módulo 11 |
| Nombre y apellido | Obligatorios, hasta 50 caracteres cada uno |
| Correo | Obligatorio, único y con hasta 100 caracteres. El dominio depende del rol |
| Contraseña de registro | Entre 8 y 72 caracteres. La tabla guarda el hash BCrypt |
| `ADMINISTRADOR` y `VETERINARIO` | Direcciones con dominio `duocuc.cl` |
| `RECEPCIONISTA` | Dominio `gmail.com` |
| `DUENO` | Dominio `profesor.duoc.cl` |

## Ejemplo de sesión en PowerShell

Con el gateway iniciado y la cuenta de demostración disponible, este ejemplo inicia sesión y consulta el perfil. La variable `$cabeceras` sirve también para los ejemplos de Pacientes y Citas.

```powershell
$api = 'http://localhost:9001/api/v1'
$credenciales = @{ email = 'cliente@profesor.duoc.cl'; password = 'Cliente123' }
$sesion = Invoke-RestMethod -Method Post -Uri "$api/auth/login" -ContentType 'application/json' -Body ($credenciales | ConvertTo-Json)
$cabeceras = @{ Authorization = "Bearer $($sesion.token)" }
Invoke-RestMethod -Uri "$api/auth/me" -Headers $cabeceras
```

El login devuelve `token`, `tipo`, `expiraEn` y `usuario`. Un RUN inválido o un correo incompatible con el rol provoca un error de validación. Al registrar un correo ya utilizado se obtiene 409. Las reglas del RUN y del dominio tienen pruebas en [ReglasUsuarioTest.java](src/test/java/cl/VeterinariaSanMarcos/usuarios/service/ReglasUsuarioTest.java).

## Ejecución y verificación

En Compose escucha en el puerto interno `9002` y accede al esquema `usuarios` como `app_usuarios` con `DB_USUARIOS_PASSWORD`. Sigue la [guía del backend](../README.md) para levantar las dependencias y el gateway. El contrato con los campos de cada solicitud y respuesta está disponible en [OpenAPI de usuarios](http://localhost:9001/openapi/usuarios).

Desde la carpeta del backend puedes ejecutar las pruebas del módulo con `mvn -pl ms-usuarios -am test`.
