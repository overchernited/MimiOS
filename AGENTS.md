# MimicroOS — Guía del proyecto

## Qué es

Sistema operativo para la familia de dispositivos ESP32 (clásico, S3, C3 y S2; C6 pendiente de soporte Arduino). Tiene un "escritorio" web (frontend en Svelte), un puente de comunicación (server Node) que conecta el dispositivo con el navegador, y un **catálogo** (marketplace) de apps, widgets y firmwares (cartuchos) que vive en **Supabase**.

## La idea central (una sola oración)

El catálogo vive en Supabase, el frontend habla **directo** con Supabase (sin pasar por el server Node), y el server Node queda solo como puente entre el ESP32 y el navegador (WebSocket).

```
Navegador ──▶ Supabase (catálogo: apps, widgets, cartuchos + archivos .bin)
Navegador ──▶ Server Node ──▶ ESP32 (solo datos del dispositivo, no el catálogo)
```

## Quién puede hacer qué (la regla de oro)

- **Cualquiera que abra el frontend** (sin iniciar sesión): puede **ver** el catálogo y **descargar** los `.bin`.
- **Un desarrollador con sesión iniciada**: además puede **agregar** apps/widgets/cartuchos nuevos y **subir** `.bin`, y **borrar solo lo que él haya subido`.
- **Nadie** puede **modificar** filas del catálogo (ni los desarrolladores), y **nadie** puede borrar lo que no subió: el catálogo guarda quién sube cada registro, y el borrado se limita a filas de ese mismo usuario. El único "cambio" extra permitido es sumar el contador de descargas, y se hace a través de una función especial del sistema.
- El server Node **no** guarda datos del catálogo: solo reenvía mensajes entre el dispositivo y el navegador.

## Cuentas, publicaciones y perfiles

- El login/signup (email+password) vive en un **modal terminal** (`components/auth/auth-modal.svelte`); al registrarse se crea su **perfil** automáticamente (trigger `handle_new_user`: username del metadata, fallback = parte local del email, con sufijo numérico si choca).
- El modal de **publicar cartucho** (`components/upload/upload-modal.svelte`) pide título, descripción, versión, chip (dropdown), el `.bin` (lee el tamaño solo), y un **manifest en JSON** que se guarda como `jsonb` en `cartridges.manifest`.
- Cada perfil público vive en `/profile/<username>`: lista lo que subió (cartridges/apps/widgets por `user_id`) y, si es el dueño, permite borrar (storage + fila). El storage de cartuchos se organiza en `cartridges/<user_id>/<id>.bin`.
- RLS: `profiles` es de lectura pública; insert/update solo el dueño (`auth.uid() = id`).

## Los 4 flujos principales

### 1. Navegar el catálogo
El frontend pregunta a Supabase por la lista de apps/widgets/cartuchos y las muestra (ver `cortex/src/components/dev/api-check.svelte` para probar con botones que la API responde).

### 2. Descargar un firmware (.bin)
El navegador pide la URL pública del archivo en el almacenamiento de Supabase y lo baja sin necesidad de sesión. Ese `.bin` es el "cartucho" que luego se envía al ESP32 por el WebSocket para flashearlo (OTA).

### 3. Sumar una descarga
Cuando alguien descarga, el frontend llama a la función especial del sistema para subir el contador en 1. Es la **única** escritura permitida desde el frontend.

### 4. Publicar un cartucho (desarrollador)
El desarrollador compila su firmware, sube el `.bin` al almacenamiento y **agrega** la fila del cartucho en Supabase con su sesión iniciada. El sistema valida que tenga permisos de "agregar"; los archivos `.bin` los sube con su sesión (no los sube el frontend anónimo).

## Firmware base multi-placa

- Un `platformio.ini` con **4 entornos** (esp32, esp32-s3, esp32-c3, esp32-s2); `pio run` compila todos. C6 queda comentado hasta que el core Arduino llegue al platform espressif32.
- Los pines por placa se pasan con flags: `LED_PIN` y `CONFIG_BUTTON_PIN` (con defaults en el código). El USB CDC es solo para S3/C3.
- `tools/post_build.py` copia el bin a `.pio/build/<env>/mimios-base-<chip>.bin` tras cada build.
- El **CI** (`.github/workflows/build-firmware.yml`) buildea la matrix en paralelo y sube con service role (secrets `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`):
  - storage: `cartridges/firmware/mimios-base-<chip>.bin` (upsert).
  - DB: upsert de la fila `firmware` (file_size, version = tag `v1.2.0` → `1.2.0`, o short sha en push).
- El hub carga la lista de la tabla `firmware` (`listFirmwares()`) y ofrece un selector de chip en `base-firmware.svelte`; la descarga es `firmwareDownloadUrl(id)`.

## Permisos a nivel técnico (para no perderse)

En las 3 tablas (`apps`, `widgets`, `cartridges`):

| Acción | Quién puede | Cómo se controla |
|---|---|---|
| Ver | todos | permiso `select` al rol anónimo |
| Agregar | desarrolladores con sesión | permiso `select + insert` al rol autenticado |
| Modificar | nadie | sin permisos, sin políticas |
| Borrar lo propio | desarrolladores con sesión | permiso `delete` + policy `auth.uid() = user_id` (lo asigna un trigger al insertar) |
| Sumar descargas | todos (vía función especial) | función `increment_downloads` |

El archivo de definición vive en `supabase/migrations/20260811000000_marketplace.sql` (es el mismo que se aplica en local y el que subirá a la nube). Si se cambia, hay que reaplicarlo con `supabase db reset`.

## Levantar el entorno

```bash
# 1. Stack de Supabase local (Docker): crea las tablas y aplica la migración
supabase start
supabase db reset      # reaplica el esquema desde cero

# 2. Frontend (necesita cortex/.env con las claves locales)
pnpm run dev           # desde cortex/

# 3. Server Node (solo WebSocket del dispositivo)
pnpm run serve         # desde cortex/  (build + server en :3000)
```

## Comandos útiles

| Qué | Comando |
|---|---|
| Compilar firmware ESP32 | `pio run` (todos los envs) o `pio run -e esp32-c3` (uno) |
| Chequear tipos del frontend | `pnpm run check` (desde `cortex/`) |
| Subir esquema a la nube (después) | `supabase link --project-ref <ref>` + `supabase db push` |

## Convenciones

- **Código en inglés**: los comentarios en el código, mensajes de log, nombres de variables y textos de UI van en **inglés**.
- **Conversación en español**: tú y yo (y las notas del proyecto) hablamos en **español**. El inglés es solo para el código.
- Ejemplo: en el firmware y el frontend, `Serial.printf("connected to server")` no `"conectado al server"`.

## Nota de red

Desde esta máquina, `api.supabase.co` (nube) y `cli.supabase.com` no responden; el paso a la nube se hace desde otra red. El entorno local (`127.0.0.1:54321`) funciona sin problema.
