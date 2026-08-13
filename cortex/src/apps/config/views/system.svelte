<script lang="ts">
  import { StorageStore } from '@/stores/storage.svelte';

  const os = $derived(String(StorageStore.get('os') ?? 'Mimi OS'));
  const model = $derived(String(StorageStore.get('model') ?? 'Unknown device'));
  const cartridge = $derived(String(StorageStore.get('cartridge') ?? ''));
  
  
  const cartridgeVersion = $derived(String(StorageStore.get('cartridge_version') ?? ''));


</script>

<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-6">
  <h2 class="montserrat text-xl font-bold">System</h2>

  <div class="text-7xl text-center rounded-2xl  px-5 py-4">
    <span class="font-bold">{os}</span>
  </div>

  <div class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
    <span class="text-sm opacity-70">Device Model</span>
    <span class="font-bold">{model}</span>
  </div>

  <div class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
    <span class="text-sm opacity-70">Installed Cartridge</span>
    <span class="font-bold">
      
    {#if cartridge}
    <span class="font-bold">{cartridge}</span>
    <span class="font-medium text-xs">v{cartridgeVersion}</span>
    {:else}
    <span class="font-bold">No cartridge installed</span>
    {/if}
    </span>
  </div>
</div>
