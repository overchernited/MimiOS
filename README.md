# MimiOS

A web operating system for the ESP32 family (classic, S3, C3, S2). The browser renders a desktop-style interface for the device while a catalog — hosted on Supabase — distributes apps, widgets, and firmware.

## Architecture

```
Browser (cortex "desktop")          Browser (hub catalog)
┌────────────────────────┐          ┌────────────────────────┐
│ window manager         │          │ SvelteKit landing +     │
│ widgets grid, taskbar  │          │ marketplace             │
│ apps as custom elements│          └───────────┬────────────┘
└───────────┬────────────┘                      │ REST
            │ WebSocket                         ▼
            │                 ┌──────────────────────────────┐
            ▼                 │          Supabase            │
┌────────────────────────┐    │  apps / widgets / cartridges │
│  Node WebSocket relay  │    │  + firmware .bin in storage  │
│  (server.ts, :3000)    │    └──────────────────────────────┘
└───────────┬────────────┘
            │ WebSocket
            ▼
┌────────────────────────┐
│    ESP32 (firmware)    │
│  base firmware + OTA   │
└────────────────────────┘
```

Two data channels:

- **Catalog**: the browser talks directly to Supabase (REST) — list, download `.bin`, publish with a developer session, increment download counters. The Node server never touches the catalog.
- **Device**: the browser reaches the ESP32 only through the Node WebSocket relay — JSON commands and binary frames for OTA chunks.

## Repository layout

| Path | Component |
|---|---|
| `firmware/` | PlatformIO base firmware, one environment per board (ESP32, S3, C3, S2) |
| `cortex/` | Svelte "desktop" frontend + the Node WebSocket relay (`server.ts`) |
| `hub/` | SvelteKit catalog frontend (landing, marketplace, profiles) |
| `supabase/` | Database schema, RLS policies and migrations |
| `.github/workflows/` | CI: builds the firmware matrix and publishes it to Supabase |

## Components

### Firmware (`firmware/`)

Arduino framework on the ESP32. `pio run` builds all four board environments; per-board pins are injected via `LED_PIN` / `CONFIG_BUTTON_PIN` build flags. A post-build script copies each artifact to `.pio/build/<env>/mimios-base-<chip>.bin`.

- Connects to the Node relay over WebSocket (JSON for commands, binary frames for OTA chunks).
- OTA uses dual partitions with automatic rollback on failed boot.
- Cartridge metadata persists to NVS and LittleFS.

### Cortex (`cortex/`)

Two pieces sharing one package:

- **Frontend**: Svelte 5 desktop OS — window manager, widget grid, taskbar, apps registered as custom elements. Talks to Supabase directly for anything catalog-related and to the relay for device data.
- **Relay**: Node server (`server.ts`) that serves the built frontend and upgrades HTTP to the WebSocket that bridges browser and device. It is stateless and holds no catalog data.

### Hub (`hub/`)

SvelteKit catalog. Anonymous visitors can browse and download; authenticated developers can publish and remove their own items. Uses `increment_downloads` (RPC) as the only counter write. Also hosts the base-firmware download with a per-chip selector.

### Supabase (`supabase/`)

Single migration defining `apps`, `widgets`, `cartridges`, `firmware` and `profiles` with RLS:

| Action | Who |
|---|---|
| View / download | everyone (anon) |
| Insert | authenticated developers |
| Delete | only rows owned by the caller |
| Update | nobody (except `profiles` owner and CI `firmware` via service role) |

## Development

Requires Docker (local Supabase) and PlatformIO.

```bash
# 1. Local Supabase stack (applies migrations)
supabase start

# 2. Frontend (needs cortex/.env with local keys)
pnpm run dev            # from cortex/

# 3. Node relay (WebSocket bridge)
pnpm run serve          # from cortex/  (build + server on :3000)

# 4. Firmware
pio run                 # from firmware/ (all boards) or pio run -e esp32-c3
```

Reapply the schema with `supabase db reset`.

## CI/CD

GitHub Actions builds the firmware matrix on `main` pushes and `v*` tags, then uploads each `.bin` to Supabase storage and upserts the `firmware` row using the service role. Requires repository secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — architecture and data channels
- [`docs/OTA.md`](docs/OTA.md) — over-the-air update flow
- [`docs/deploy.md`](docs/deploy.md) — deploying the schema to Supabase cloud and wiring the CI
