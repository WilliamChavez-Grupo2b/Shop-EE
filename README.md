# Shop-EE

Shop-EE es una tienda web full stack desarrollada con NestJS, TypeScript, React y PostgreSQL. Permite consultar y administrar productos y categorías, crear pedidos, registrar pagos y envíos, y gestionar perfiles de usuarios.

## Funcionalidades

- Catálogo de productos con búsqueda, creación, edición y eliminación.
- Administración de categorías.
- Gestión de pedidos y actualización de su estado.
- Registro de pagos y envíos.
- Administración de perfiles de usuario.
- Flujo de carrito y checkout desde el frontend.

## Tecnologías

- Backend: NestJS, TypeORM y PostgreSQL.
- Frontend: React, React Router y Vite.
- Contenedores: Docker y Docker Compose.
- Pruebas: Jest y Supertest.

## Requisitos

### Ejecución local

- Node.js 22 o superior.
- npm.
- PostgreSQL 16 o compatible.

### Ejecución con Docker

- Docker.
- Docker Compose.

## Configuración de la base de datos

La aplicación utiliza PostgreSQL. Los valores predeterminados son:

| Variable | Valor predeterminado | Descripción |
| --- | --- | --- |
| `POSTGRES_HOST` | `localhost` | Host de PostgreSQL. Dentro de Docker Compose se usa `db`. |
| `POSTGRES_PORT` | `5433` | Puerto de PostgreSQL. |
| `POSTGRES_DB` | `shop_ee` | Nombre de la base de datos. |
| `POSTGRES_USER` | `shop_ee_user` | Usuario de PostgreSQL. |
| `POSTGRES_PASSWORD` | `shop_ee_pass` | Contraseña de PostgreSQL. |

El backend también admite estas variables adicionales:

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP del backend. Predeterminado: `3000`. |
| `OPEN_AI_API_KEY` | API key opcional para el servicio de integración con OpenAI. |
| `VITE_API_URL` | URL del backend usada por el frontend. Si no se define, se usa `/api`. |

TypeORM está configurado con `synchronize: true`, por lo que crea o actualiza las tablas de entidades durante el desarrollo. Para entornos productivos se recomienda desactivar la sincronización y usar migraciones.

Los scripts SQL de referencia se encuentran en:

- `database/products/products.sql`
- `database/orders/orders.sql`
- `database/payment/payment.sql`
- `database/profile/profile.sql`
- `database/shipment/shipment.sql`

## Instalación y ejecución

### 1. Instalar dependencias

Desde la raíz del proyecto:

```powershell
npm ci
cd frontend
npm ci
cd ..
```

Si solo se necesita el backend, el primer comando basta.

### 2. Crear la base de datos

Se puede iniciar PostgreSQL con Docker sin levantar todavía el backend:

```powershell
docker compose up -d db
```

También se puede usar una instalación local de PostgreSQL y crear la base `shop_ee` con el usuario y la contraseña indicados anteriormente.

### 3. Configurar variables de entorno

Para la ejecución local se pueden exportar las variables en PowerShell:

```powershell
$env:POSTGRES_HOST="localhost"
$env:POSTGRES_PORT="5433"
$env:POSTGRES_DB="shop_ee"
$env:POSTGRES_USER="shop_ee_user"
$env:POSTGRES_PASSWORD="shop_ee_pass"
$env:PORT="3000"
```

Opcionalmente, para habilitar la integración de OpenAI:

```powershell
$env:OPEN_AI_API_KEY="tu-api-key"
```

No es necesario crear un archivo `.env`, pero `@nestjs/config` permite usarlo en la raíz del proyecto. Ejemplo:

```dotenv
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=shop_ee
POSTGRES_USER=shop_ee_user
POSTGRES_PASSWORD=shop_ee_pass
PORT=3000
OPEN_AI_API_KEY=
```

### 4. Ejecutar el backend

```powershell
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`.

Rutas principales:

| Recurso | Ruta base |
| --- | --- |
| Productos | `/products` |
| Categorías | `/categories` |
| Pedidos | `/orders` |
| Pagos | `/payment` |
| Envíos | `/shipment` |
| Usuarios | `/users` |

La ruta `GET /` responde con un mensaje de estado del servidor.

### 5. Ejecutar el frontend

En otra terminal:

```powershell
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173`. Vite redirige las peticiones `/api` al backend en `http://localhost:3000`.

Para apuntar el frontend a otro backend:

```powershell
$env:VITE_API_URL="http://localhost:3000"
npm run dev
```

## Ejecución completa con Docker

Desde la raíz del proyecto:

```powershell
docker compose up --build
```

Docker Compose levantará:

- PostgreSQL en `localhost:5433`.
- El backend en `http://localhost:3000`.

Para detener los contenedores:

```powershell
docker compose down
```

Para eliminar también los datos persistentes de PostgreSQL:

```powershell
docker compose down -v
```

Las variables de Docker Compose pueden cambiarse sin editar el archivo:

```powershell
$env:POSTGRES_DB="shop_ee"
$env:POSTGRES_USER="shop_ee_user"
$env:POSTGRES_PASSWORD="shop_ee_pass"
$env:POSTGRES_PORT="5433"
$env:OPEN_AI_API_KEY="tu-api-key"
docker compose up --build
```

## Pruebas

Desde la raíz del proyecto:

```powershell
# Pruebas unitarias
npm test

# Pruebas en modo observación
npm run test:watch

# Cobertura
npm run test:cov

# Pruebas end-to-end
npm run test:e2e
```

Para compilar y validar el backend:

```powershell
npm run build
npm run lint
```

Para compilar el frontend:

```powershell
cd frontend
npm run build
```

## Producción local

Backend:

```powershell
npm run build
npm run start:prod
```

Frontend:

```powershell
cd frontend
npm run build
npm run preview
```
