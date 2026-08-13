<script lang="ts">
  import type { Firmware } from "$lib/types";
  import { catalogDownloadUrl, formatBytes } from "$lib/marketplace";
  import TerminalWindow from "../terminal-window.svelte";

  let { items }: { items: Firmware[] } = $props();

  const CHIP_LABELS: Record<string, string> = {
    esp32: "ESP32",
    esp32c3: "ESP32-C3",
    esp32s3: "ESP32-S3",
    esp32s2: "ESP32-S2",
  };

  let selectedId = $state<string | null>(null);
  let downloading = $state(false);
  let msg = $state<string | null>(null);

  const selected = $derived(
    items.find((f) => f.id === selectedId) ??
      items.find((f) => f.chip === "esp32c3") ??
      items[0] ??
      null,
  );

  const downloadUrl = $derived(selected ? catalogDownloadUrl(selected) : null);

  async function handleDownload(url: string, name: string) {
    if (downloading) return;
    downloading = true;
    msg = null;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      msg = "> download started";
    } catch (err) {
      msg = `> failed — ${err instanceof Error ? err.message : String(err)}`;
    } finally {
      downloading = false;
    }
  }
</script>

<TerminalWindow title="mimios@hub: ~/firmware — base">
  <div class="grid items-center gap-10 p-8 md:grid-cols-[1fr_auto]">
    <div>
      <p class="m-0 mb-3 text-xs text-faint">
        $ fetch firmware --chip {selected
          ? (CHIP_LABELS[selected.chip] ?? selected.chip.toUpperCase())
          : "auto"}
      </p>
      <h3 class="text-2xl">
        MimiOS
        <span class="text-xs font-normal text-dim"
          >v{selected?.version ?? "—"}</span
        >
      </h3>
      <p class="m-0 mt-3 max-w-xl text-sm leading-relaxed text-dim">
        {selected?.description ??
          "Boot firmware for the ESP32 family: network layer, WebSocket bridge to the browser and the desktop runtime. Flash it once, then keep updating over the air."}
      </p>

      {#if items.length > 0}
        <div
          class="mt-5 flex flex-wrap gap-2"
          role="group"
          aria-label="select chip"
        >
          {#each items as f (f.id)}
            <button
              class="terminal-chip"
              class:active={f.id === selected?.id}
              onclick={() => (selectedId = f.id)}
            >
              {CHIP_LABELS[f.chip] ?? f.chip.toUpperCase()}
            </button>
          {/each}
        </div>
      {/if}

      <ul class="m-0 mt-5 list-none space-y-1 p-0 text-xs text-dim">
        <li>
          <span class="text-accent">✓</span> chip —
          <span class="text-fg"
            >{selected
              ? (CHIP_LABELS[selected.chip] ?? selected.chip)
              : "—"}</span
          >
        </li>
        <li>
          <span class="text-accent">✓</span> size —
          <span class="text-fg"
            >{selected ? formatBytes(selected.file_size ?? 0) : "—"}</span
          >
        </li>
        <li>
          <span class="text-accent">✓</span> flash —
          <span class="text-fg">USB + OTA</span>
        </li>
        <li>
          <span class="text-accent">✓</span> ota —
          <span class="text-fg">dual partition, auto-rollback</span>
        </li>
      </ul>
    </div>

    <div class="flex flex-col items-start gap-2 md:items-end">
      <button
        class="btn"
        onclick={() =>
          selected &&
          downloadUrl &&
          handleDownload(downloadUrl, `${selected.id}.bin`)}
        disabled={downloading || !downloadUrl || !selected}
      >
        {downloading ? "starting download…" : "download .bin"}
      </button>
      {#if msg}
        <p class="m-0 text-xs text-dim">{msg}</p>
      {/if}
    </div>
  </div>
</TerminalWindow>

<style>
  .terminal-chip {
    background: transparent;
    border: 1px solid var(--color-line);
    border-radius: 4px;
    color: var(--color-dim);
    font: inherit;
    font-size: 0.6875rem;
    letter-spacing: 0.12em;
    padding: 0.35rem 0.75rem;
    cursor: pointer;
    transition:
      border-color 0.15s,
      color 0.15s,
      background-color 0.15s;
  }

  .terminal-chip:hover {
    border-color: var(--color-accent);
    color: var(--color-fg);
  }

  .terminal-chip.active {
    border-color: var(--color-accent);
    color: var(--color-fg);
    background: color-mix(in srgb, var(--color-accent) 12%, transparent);
  }
</style>
