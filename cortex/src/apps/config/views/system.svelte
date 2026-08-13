<script lang="ts">
  import type { OSContext } from "mimicortex";
  import ConfigCard from "../components/config-card.svelte";

  let { services }: { services: OSContext } = $props();

  const prefs = $derived(services?.storage?.preferences);

  const os = $derived(String(prefs.os ?? "Mimi OS"));
  const model = $derived(String(prefs.model ?? "Unknown device"));
  const cartridge = $derived(String(prefs.cartridge ?? ""));
  const cartridgeVersion = $derived(String(prefs.cartridge_version ?? ""));
  const cores = $derived(Number(prefs.cores ?? 0));
  const cpuFreq = $derived(Number(prefs.cpu_freq ?? 0));
  const revision = $derived(Number(prefs.revision ?? 0));
  const flashSize = $derived(Number(prefs.flash_size ?? 0));
  const flashSpeed = $derived(Number(prefs.flash_speed ?? 0));
  const heap = $derived(Number(prefs.heap ?? 0));
  const mac = $derived(String(prefs.mac ?? "0000-0000-0000"));
</script>

<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-6">
  <h2 class="montserrat text-xl font-bold">System</h2>

  <div class="text-7xl text-center rounded-2xl px-5 py-4">
    <span class="font-bold">{os}</span>
  </div>

  <ConfigCard label="Device Model">
    {model} - {revision}
  </ConfigCard>

  <ConfigCard label="Installed Cartridge">
    {#if cartridge}
      <span>{cartridge}</span>
      <span class="font-medium text-xs text-white/60 ml-1"
        >v{cartridgeVersion}</span
      >
    {:else}
      <span>{os}</span>
    {/if}
  </ConfigCard>

  <ConfigCard label="CPU">
    {cores} cores @ {cpuFreq} MHz
  </ConfigCard>

  <ConfigCard label="Heap">
    {services.formatBytes(heap)}
  </ConfigCard>

  <ConfigCard label="Flash">
    {services.formatBytes(flashSize)} @ {services.formatBytes(flashSpeed)}/s
  </ConfigCard>

  <ConfigCard label="MAC Address">
    {mac}
  </ConfigCard>
</div>