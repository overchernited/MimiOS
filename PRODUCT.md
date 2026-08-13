# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are **developers**: software and firmware developers who want a hackable operating system for the ESP32-C3. They flash the base firmware, connect the browser desktop to the board, build and publish apps, widgets and cartridges, and install them over the air.

Confirmed secondary audience: any visitor of the hub/frontend can browse the catalog and download `.bin` files without a session. Publishing requires an authenticated developer session.

## Product Purpose

MimiOS is an operating system for ESP32-C3 devices with a desktop-style web frontend. The browser talks **directly** to Supabase for the catalog (apps, widgets, cartridges plus `.bin` firmware in storage); the Node server is only a stateless WebSocket bridge between the browser and the device. The **hub** is the landing and marketplace page (SvelteKit, deployed to Vercel): it is where people download the base firmware and browse the community catalog.

## Positioning

A **web desktop for chips**: a full desktop experience in the browser for a low-cost microcontroller (ESP32-C3), backed by an open marketplace where widgets, apps and cartridges install over the air — no cables, no compiling.

## Operating Context

- Developers flash the base firmware (`.bin`) over USB or OTA; afterwards the browser reaches the board through the Node WebSocket relay (`:3000`).
- OTA flashes firmware in dual partitions (`ota_0`/`ota_1`) with automatic rollback on a failed boot; flashing is protected by device auth (`validate_auth`).
- Catalog data lives in Supabase. Anonymous users can `SELECT` and download; authenticated developers can `INSERT` and `DELETE` only their own rows; nobody can `UPDATE`. The only write from an anonymous frontend is the `increment_downloads` RPC.
- From the current dev machine, `api.supabase.co` and `cli.supabase.com` do not respond; cloud deployment happens from another network. Local Supabase (`127.0.0.1:54321`) works.

## Capabilities and Constraints

Capabilities:

- Web desktop in the browser: window manager, widgets grid, taskbar, apps as custom elements.
- WebSocket relay between browser and device: single transport layer, JSON commands and binary frames for OTA chunks.
- Marketplace on Supabase: `apps`, `widgets`, `cartridges` tables plus public storage bucket `cartridges` for the `.bin` files.
- OTA state machine: `ota_start` / binary chunks / `ota_end` / `ota_cancel` / `ota_rollback`, with cartridge metadata persisted to NVS and LittleFS.
- Hub landing page with base-firmware download and catalog entry points, wired to Supabase for later catalog pages.

Constraints:

- Hardware target: ESP32-C3 (160 KB RAM), dual OTA partitions.
- The Node server holds **no** catalog data.
- Hard rule: no one can modify catalog rows; the download counter only moves through `increment_downloads`.
- Catalog schema lives in `supabase/migrations/20260811000000_marketplace.sql`; changing it requires `supabase db reset`.

Terminology: **apps**, **widgets** (desktop panels), **cartridges** (`.bin` firmware packages), **cortex** (the browser desktop frontend), **hub** (the Vercel landing/marketplace page), **OTA** (over-the-air firmware update).

## Brand Commitments

- Name: **MimiOS** (also written MimicroOS).
- Hub visual identity is binding: black palette + terminal aesthetic (monospace/terminal fonts, `$` prompts, cursor motif, scanline/grid textures).
- UI copy and code in English; project conversation and notes in Spanish.

## Evidence on Hand

- `supabase/migrations/20260811000000_marketplace.sql` — schema, RLS policies, storage bucket, seed data (3 apps, 5 widgets, 1 cartridge: `mimios-base-c3`).
- `docs/architecture.md` and `docs/OTA.md` — architecture and OTA protocol.
- `cortex/` — existing browser desktop frontend (Vite + Svelte 5 + Tailwind).
- `hub/` — SvelteKit landing page for Vercel.
- No real user testimonials, case studies, or production deployment evidence; future work must not fabricate any.

## Product Principles

1. Catalog integrity is sacred: no row edits, deletions limited to the author, and the download counter only via the system RPC.
2. Open by default: anyone can browse and download; publishing requires a session.
3. Developers first: publishing a firmware/app must be frictionless — upload, add, own-delete.
4. Keep the bridge thin: the Node server only relays device traffic and never touches the catalog.
5. Terminal honesty: the black/terminal identity should communicate clearly and never decorate dishonestly.
