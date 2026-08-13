<script lang="ts">
  import { onMount } from 'svelte';
  import Terminal from '../components/terminal.svelte';
  import CatalogPanel from '../components/catalog-card.svelte';
  import BaseFirmware from '../components/base-firmware/base-firmware.svelte';
  import { marketplace } from '$lib/marketplace';
  import { listFirmwares } from '$lib/firmware';
  import type { CatalogItem, Firmware } from '$lib/types';
  import { Puzzle, AppWindow, Cpu } from '@lucide/svelte';
  import Hero from '../components/hero.svelte';

  let widgets: CatalogItem[] = $state([]);
  let apps: CatalogItem[] = $state([]);
  let cartridges: CatalogItem[] = $state([]);
  let firmwares: Firmware[] = $state([]);

  let loading = $state(true);
  let error: string | null = $state(null);

  onMount(async () => {
    try {
      const [w, a, c, fw] = await Promise.all([
        marketplace.list('widgets'),
        marketplace.list('apps'),
        marketplace.list('cartridges'),
        listFirmwares()
      ]);
      widgets = w;
      apps = a;
      cartridges = c;
      firmwares = fw;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }

  });
</script>

<svelte:head>
  <title>MimiOS Hub — firmware &amp; marketplace for ESP32</title>
</svelte:head>

<!-- Hero -->
<Hero widgets={widgets.length} apps={apps.length} cartridges={cartridges.length} ready={!loading && !error} />

<!-- Catalog -->
<section class="border-b border-line" id="catalog">
  <div class="container py-10 md:py-10">
    <h2 class="section-title">Catalog</h2>
    <div class="flex flex-col">
      <CatalogPanel
        id="widgets"
        name="Widgets"
        icon={Puzzle}
        description="Live panels that render on the desktop grid: sensor monitors, notifications, taskbar, devices and more."
        items={widgets}
        loading={loading}
        error={error}
      />
      <CatalogPanel
        id="apps"
        name="Apps"
        icon={AppWindow}
        description="Full applications launched from the desktop: shell, logger, file manager and anything the community builds."
        items={apps}
        loading={loading}
        error={error}
      />
      <CatalogPanel
        id="cartridges"
        name="Cartridges"
        icon={Cpu}
        description="Firmware packages (.bin) flashed over the air to the device, built by the community."
        items={cartridges}
        loading={loading}
        error={error}
      />
    </div>
  </div>
</section>

<!-- Base firmware -->
<section class="border-b border-line" id="firmware">
  <div class="container py-20 md:py-28">
    <h2 class="section-title">Base firmware</h2>

    <BaseFirmware items={firmwares} />
  </div>
</section>

<!-- How it works -->
<section id="how">
  <div class="container py-20 md:py-28">
    <h2 class="section-title">How it works</h2>
    <div class="grid gap-5 md:grid-cols-3">
      {#each [
        { n: '01', cmd: 'download', text: 'Grab the base firmware .bin from the hub — no account needed.' },
        { n: '02', cmd: 'flash', text: 'Send it to the board over the WebSocket bridge and flash it over the air.' },
        { n: '03', cmd: 'install', text: 'Browse widgets, apps and cartridges and install them on the desktop.' }
      ] as step}
        <div class="terminal-card p-6">
          <p class="m-0 mb-3 text-xs text-faint">$ {step.n} {step.cmd}</p>
          <p class="m-0 text-sm text-dim">{step.text}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="border-t border-line bg-soft">
  <div class="container flex flex-col items-center gap-6 py-20 text-center">
    <p class="m-0 text-xs uppercase tracking-[0.2em] text-dim">
      <span class="text-accent">$</span> ready when you are
    </p>
    <p class="m-0 max-w-lg text-lg leading-relaxed text-fg">
      grab the firmware and start <span class="text-accent">building</span> for your board.
    </p>
    <a class="btn" href="#firmware">↓ download .bin</a>
  </div>
</section>
