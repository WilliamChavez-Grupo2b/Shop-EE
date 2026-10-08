# SHOPP API

Backend de catalogo y venta de productos fisicos y digitales, con pago por **transferencia bancaria**, recomendaciones con **IA** y envios conectados a **hardware**.

## Arquitectura

```
Cliente / Admin (web, app)
        |  JWT
        v
  shopp-api  (NestJS)                 <-- backend PRINCIPAL
  catalogo, variedades, pedidos, pagos, recomendaciones, IA
        |  x-api-key               ^  x-internal-key
        v                          |
  shopp-shipping (Nest.js)  --------+
  base de datos de envios + hardware (MQTT: impresora de etiquetas, lectores)
```

- **shopp-api** es la fuente de verdad: usuarios, productos, pedidos, pagos.
- **shopp-shipping** solo sabe de envios. La API principal le pide crear un envio al aprobar un pago; Nest le avisa a la API principal cuando un lector marca "en transito" o "entregado".

## Flujo de compra (transferencia)

1. `POST /api/orders` -> pedido `PENDING_PAYMENT` + datos bancarios + **codigo de referencia** (`SHOPP-XXXXXXXX`) que el cliente pone en el concepto. El stock fisico se reserva.
2. El cliente transfiere y envia `POST /api/orders/{id}/payment-proof` (numero y URL del comprobante) -> `PAYMENT_REVIEW`.
3. Admin revisa `GET /api/admin/payments/pending` y aprueba/rechaza.
   - **Aprobar** -> `PAID`. Si hay productos fisicos, se crea el envio en Nest y se imprime la etiqueta.
   - **Rechazar** -> vuelve a `PENDING_PAYMENT` con el motivo; el cliente puede reenviar comprobante.
4. Digitales: `GET /api/orders/{id}/downloads` solo responde cuando el pago esta aprobado.
5. Hardware escanea la guia -> `POST /shipments/scan` en Nest -> Nest avisa a la API principal -> `SHIPPED` / `DELIVERED`.

## Endpoints principales (NestJS, puerto 8080)

| Metodo | Ruta | Quien |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | publico |
| GET | `/api/products?q=&categoryId=&type=`, `/api/products/{id}`, `/api/categories` | publico |
| GET | `/api/recommendations/products/{id}` | publico |
| GET | `/api/recommendations/me` | cliente |
| POST/GET | `/api/orders`, `/api/orders/{id}` | cliente |
| POST | `/api/orders/{id}/payment-proof`, `/cancel` | cliente |
| GET | `/api/orders/{id}/downloads` | cliente (pago aprobado) |
| POST/PUT/DELETE | `/api/admin/products`, `/api/admin/categories` | admin |
| POST | `/api/admin/products/ai-description` | admin (IA) |
| GET | `/api/admin/payments/pending` | admin |
| POST | `/api/admin/payments/{id}/approve`, `/reject` | admin |
| POST | `/api/admin/orders/{id}/shipment/retry` | admin |

Nest (puerto 3000): `POST /shipments`, `GET /shipments/:id`, `PATCH /shipments/:id/status`, `POST /shipments/scan`.

## Como correrlo

```bash
cd Shop-EE
cp .env.example .env      # edita los valores
docker compose up --build
```
- API: http://localhost:8080 — admin inicial: el de `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- Sin Docker: levanta dos Postgres (ver `docker-compose.yml`), luego `npm install && npm run start:dev` en `shopp-api` y `shopp-shipping`.

## Seguridad ya incluida

JWT con roles, contrasenas con BCrypt, rutas admin protegidas, llaves separadas para servicio-a-servicio y dispositivos (comparacion en tiempo constante), validacion de entradas, precio congelado en cada pedido, bloqueo de fila para que dos clientes no compren el mismo ultimo item, y la IA **no puede inventar productos** (sus resultados se validan contra la base de datos).

## Pendiente antes de produccion

- Cambiar `synchronize: true` por migraciones TypeORM antes de produccion.
- Subida de comprobantes y archivos digitales a almacenamiento privado (S3/GCS con URLs prefirmadas); hoy se guardan como URL.
- Expiracion automatica de pedidos sin pago (libera el stock reservado).
- TLS en todo, MQTT con usuarios, limites de peticiones, tests automaticos y CI.
- Nunca subas `.env` al repositorio.
