# XV Yan · Selfies en vivo

Los invitados escanean un QR, se toman una selfie y aparece al momento en la pantalla del salón. Todas las fotos quedan guardadas para los dueños, que pueden descargarlas en un ZIP.

- **Páginas:** GitHub Pages (carpeta `docs/`).
- **Fotos:** Supabase (almacenamiento privado + tabla `fotos`).

## Páginas

| Ruta | Para quién | Qué hace |
|---|---|---|
| `/` | Invitados (destino del QR) | Tomar o elegir foto, nombre, mensaje y enviar |
| `/qr/` | Impresión | Tarjeta con el QR para las mesas |
| `/pantalla/` | Proyector (cuenta de dueños) | Espera con QR y carrusel en vivo |
| `/galeria/` | Dueños | Ver, descargar una foto o todas en ZIP |
| `/admin/` | Dueños | Quitar fotos |

Los invitados **solo pueden subir**: no pueden ver, listar ni borrar fotos. Eso lo garantizan las reglas de `supabase/setup.sql`, no la página.

## Filtro de fotos

Antes de enviar, el celular del invitado revisa la foto, sin mandarla a ningún servidor:

- **Que haya una cara visible.** Los lentes oscuros, sombreros y gorras sí pasan; objetos, memes o fotos sin personas no.
- **Que no sea contenido para adultos.**

Usa [face-api](https://github.com/vladmandic/face-api) (TinyFaceDetector, MIT) y el modelo MobileNetV2 de [NSFWJS](https://github.com/infinitered/nsfwjs) (MIT), alojados en `docs/vendor` y `docs/modelos`. Es un filtro en el navegador: no sustituye al panel `/admin/` para quitar algo que se cuele.

## Puesta en marcha (una sola vez)

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. **SQL Editor → New query**: pega `supabase/setup.sql` y dale **Run**.
3. **Authentication → Sign In / Providers**: apaga **Allow new users to sign up**, para que nadie más pueda crear cuenta.
4. **Authentication → Users → Add user → Create new user**: correo y contraseña de los dueños (marca *Auto Confirm User*).
5. **Project Settings → API** (o **API Keys**): copia la **Project URL** y la clave **anon / publishable** en `docs/config.js`.
6. En GitHub: **Settings → Pages → Branch `main`, carpeta `/docs`** → Save.

## El día de la fiesta

- **Antes:** entra a Supabase y verifica que el proyecto esté activo. El plan gratis lo pausa tras 7 días sin uso; se reactiva con **Restore**.
- Abre `/pantalla/` en la computadora del proyector, entra con la cuenta de los dueños y presiona **F** para pantalla completa.
- Imprime `/qr/` para las mesas.
- **Después:** `/galeria/` → **Descargar todas (ZIP)**.

Diseño de pantallas y celular hecho en Claude Design (vino y dorado; Pinyon Script, Cormorant Garamond, Montserrat).
