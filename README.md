# veterinaria-san-marcos

repository for the develpment of "veterinaria san marcos's" website and micro services

## 🚀 Iniciar el proyecto

### Requisitos

Para ejecutar el proyecto necesitas tener instalado:

- [Docker](https://www.docker.com/)
- [git](git-scm.com/install/windows)
- Docker Compose (incluido en Docker Desktop)

No es necesario instalar Node.js ni npm directamente en el computador, ya que el proyecto utiliza Node.js mediante Docker.

### 📥 Clonar el repositorio

en una terminal Clona el repositorio, entra a la carpeta del proyecto y cambia a tu rama:

```bash
git clone https://github.com/igna-alva-uni/veterinaria-san-marcos.git
cd veterinaria-san-marcos
git checkout -b nombre-de-tu-rama
```

para inicia el contenedor docker

```bash
docker desktop start
docker compose up --build
```

para detener el contenedor:

```bash
docker compose down
```

para instalar dependencias:

```bash
docker compose run --rm frontend npm install <paquete>
```

Para instalar todas las dependencias definidas en package.json:

```bash
docker compose run --rm frontend npm install
```

Para detener y eliminar los contenedores creados por Compose:

```bash
docker compose down
```

Si necesitas reconstruir completamente la imagen:

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

para ver los contenedores en ejecución:

```bash
docker compose ps
```
