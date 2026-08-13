# OTA Update

Firmware update ("cartridge" installation) is done **over the WebSocket** between the browser and the ESP32-C3, relayed by the Node server.

## Where the code lives

| Layer | File | Role |
|---|---|---|
| Firmware | `src/network/network.cpp` | OTA state machine + binary receive loop |
| Frontend | `cortex/src/apps/marketplace/marketplace.svelte` | Downloads the `.bin`, sends it in chunks, shows progress |
| Frontend | `cortex/src/stores/ota.svelte.ts` | OTA UI state (`idle` / `downloading` / `flashing`) |
| Overlay | `cortex/src/components/ota/ota-overlay.svelte` | Fullscreen progress overlay |

## Framework-provided methods

The `Update` class comes from the **Espressif Arduino core** (installed by PlatformIO), **not** from this project. The firmware only orchestrates it.

Source: `~/.platformio/packages/framework-arduinoespressif32/libraries/Update/src/Updater.cpp`

| Method | Purpose | Used in |
|---|---|---|
| `Update.begin(size)` | Opens the free OTA partition for writing `size` bytes | `cmdOtaStart` |
| `Update.write(payload, len)` | Writes a binary chunk to the partition | `WStype_BIN` |
| `Update.end()` | Finalizes and validates the flash | `cmdOtaEnd` + auto-end |
| `Update.abort()` | Discards the partial update | on error / `cmdOtaCancel` |
| `Update.rollBack()` | Boots the previous app partition on next reboot | `cmdOtaRollback` |
| `Update.printError(Serial)` | Prints the last error reason | on any failure |

The ESP32-C3 uses **dual OTA partitions** (`ota_0` / `ota_1`). The active firmware flashes the *other* partition; if the new one fails to boot, the bootloader rolls back automatically.

## Protocol flow

```
Browser ──WS──▶ Server Node ──WS──▶ ESP32-C3
```

1. **`ota_start`** → `{ cmd: "ota_start", file_size: N }`
   - Firmware stores `otaSize = N`, resets `otaReceived = 0`, calls `Update.begin(N)`.
   - Replies `ota_result: { ok, msg }`.

2. **Binary chunks** (8 KB each, `WStype_BIN`)
   - Every chunk is written with `Update.write()`; `otaReceived` accumulates.
   - On write error: `Update.abort()` + `ESP.restart()` (rollback on boot).
   - When `otaReceived >= otaSize`: `Update.end()` + auto-reboot.
   - Chunks received while `otaActive == false` are dropped.

3. **`ota_end`** → `{ cmd: "ota_end" }` (optional graceful close)
   - `Update.end()` + `ESP.restart()`.

4. **`ota_cancel`** → `{ cmd: "ota_cancel" }` — aborts without rebooting.
5. **`ota_rollback`** → `{ cmd: "ota_rollback" }` — boots the previous firmware.

## Cartridge metadata

Before the binary chunks are sent, the frontend sends (in order):

```ts
send({ cmd: 'ota_start', file_size: bin.byteLength });
send({ cmd: 'set_cartridge', name: item.title, version: item.version });      // NVS (system-config)
send({ cmd: 'set_preference', key: 'cartridge_version', value: item.version }); // prefs.json (LittleFS)
```

Why both? `set_cartridge` persists to NVS, but the *old* firmware still running processes it and does not know about `cartridge_version`. `set_preference` writes to `prefs.json` on LittleFS, which **survives OTA** (OTA only touches the app partition, not the data partition). On boot, the frontend prefers the NVS value and falls back to `prefs.json`.

## OTA is protected

The browser asks for the **user password** (username + password, validated by the device via `validate_auth`) before starting a cartridge flash. See `cortex/src/apps/marketplace/ota-password.svelte`.
