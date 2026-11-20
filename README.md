# XV Yan · Selfies en vivo

Sistema para que los invitados escaneen un QR, suban su selfie y aparezca al momento en la pantalla del salón. Todas las fotos quedan guardadas.

## Páginas

| Ruta | Para quién | Qué hace |
|---|---|---|
| `/` | Invitados (destino del QR) | Tomar o elegir foto, escribir nombre y mensaje, enviar |
| `/qr` | Impresión | Tarjeta con el QR para las mesas |
| `/pantalla/?clave=…` | Proyector | Pantalla de espera y carrusel en vivo de fotos |
| `/galeria` | Organizador (contraseña) | Ver y descargar todas las fotos |
| `/admin` | Organizador (contraseña) | Quitar fotos de la pantalla y la galería |

## Cómo funciona

- Sitio estático en `public/` + funciones de Netlify en `netlify/functions/`.
- Las fotos se guardan en **Netlify Blobs** (store `fotos-xv`).
- El celular reduce la foto a 1600 px antes de subirla.
- La pantalla consulta fotos nuevas cada 3 segundos.

| Función | Ruta | Descripción |
|---|---|---|
| `upload.mts` | `POST /api/upload` | Guarda una foto (máx. 4 MB, límite de 15 por minuto por IP) |
| `list.mts` | `GET /api/fotos` | Lista de fotos; requiere header `x-clave` |
| `photo.mts` | `GET /api/foto/:id` | Sirve una foto |
| `delete.mts` | `POST /api/borrar` | Borra una foto; requiere header `x-admin` |

## Variables de entorno (en Netlify, nunca en el código)

- `ADMIN_PASSWORD`: contraseña de la galería y del panel.
- `PANTALLA_KEY`: clave de la pantalla del proyector.

## Publicar

```bash
npm install
netlify deploy --prod
```

Diseño de pantallas y celular hecho en Claude Design (vino y dorado; Pinyon Script, Cormorant Garamond, Montserrat).
