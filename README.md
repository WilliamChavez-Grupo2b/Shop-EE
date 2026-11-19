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

### Pruebas de API con Postman

Postman permite probar los endpoints del backend sin utilizar el frontend.

1. Inicia PostgreSQL y el backend:

   ```powershell
   docker compose up -d db
   npm run start:dev
   ```

2. Abre Postman y crea un entorno llamado `Shop-EE Local`.
3. Agrega una variable llamada `base_url` con el valor `http://localhost:3000`.
4. Crea una nueva colección llamada `Shop-EE API`.
5. Usa `{{base_url}}` como prefijo en todas las solicitudes.

Ejemplos de solicitudes:

| Operación | Método | URL | Cuerpo JSON |
| --- | --- | --- | --- |
| Verificar el servidor | `GET` | `{{base_url}}/` | Ninguno |
| Listar productos | `GET` | `{{base_url}}/products` | Ninguno |
| Obtener un producto | `GET` | `{{base_url}}/products/1` | Ninguno |
| Crear producto | `POST` | `{{base_url}}/products` | `{"name":"Teclado","category":"electronics","value":45.99,"stock":20}` |
| Actualizar producto | `PUT` | `{{base_url}}/products/1` | `{"name":"Teclado actualizado","category":"electronics","value":49.99,"stock":18}` |
| Eliminar producto | `DELETE` | `{{base_url}}/products/1` | Ninguno |

Ejemplos para los demás recursos:

- Categorías: `GET/POST/PUT/DELETE {{base_url}}/categories`
- Pedidos: `GET/POST/PUT/DELETE {{base_url}}/orders`
- Pagos: `GET/POST/PUT/DELETE {{base_url}}/payment`
- Envíos: `GET/POST/PUT/DELETE {{base_url}}/shipment`
- Usuarios: `GET/POST/PUT/DELETE {{base_url}}/users`

Ejemplo para crear un pedido:

```http
POST {{base_url}}/orders
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2,
  "totalValue": 1799.98,
  "status": "pending"
}
```

Ejemplo para crear un pago:

```http
POST {{base_url}}/payment
Content-Type: application/json

{
  "amount": 1799.98,
  "method": "card",
  "status": "pending"
}
```

Ejemplo para crear un envío:

```http
POST {{base_url}}/shipment
Content-Type: application/json

{
  "orderId": 1,
  "tracking": "TRK-POSTMAN-001",
  "address": "Calle Principal 123",
  "status": "pending"
}
```

Para las solicitudes con cuerpo JSON, selecciona **Body**, marca **raw** y elige el formato **JSON**. En las respuestas esperadas:

- `200 OK`: consulta o actualización completada.
- `201 Created`: registro creado.
- `204 No Content`: registro eliminado.
- `404 Not Found`: el identificador no existe.
- `400 Bad Request`: el cuerpo no cumple las validaciones del DTO.

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
