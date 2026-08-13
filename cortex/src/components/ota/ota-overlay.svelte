<script lang="ts">
  import { HardDriveDownload } from '@lucide/svelte';
  import { OtaStore } from '@/stores/ota.svelte';
  import { screen } from '@/lib/transitions';

  const downloading = $derived(OtaStore.phase === 'downloading');
</script>

{#if OtaStore.active}
  <div class="fixed m-background inset-0 z-100 flex items-center justify-center" transition:screen>
    <div
      class="m-panel m-primary-background flex h-[50vh] w-[90vh] flex-col items-center justify-center gap-5 p-8 text-(--m-text-color)"
    >
      <div
        class="flex h-28 w-28 items-center justify-center rounded-full border border-(--m-accent-color)/40 bg-(--m-accent-color)/10"
      >
        <HardDriveDownload class="h-16 w-16 text-(--m-text-color)" strokeWidth={1.5} />
      </div>

      <h1 class="montserrat text-4xl font-bold tracking-wide md:text-5xl 2xl:text-6xl">OTA Update</h1>

      <p class="flex items-center gap-3 text-base font-semibold xl:text-xl">
        {downloading ? `Downloading ${OtaStore.itemName}...` : `Flashing ${OtaStore.itemName}...`} {OtaStore.progress}%
      </p>

      <div class="h-2 w-64 overflow-hidden rounded-full bg-white/10">
        <div
          class="h-full rounded-full bg-(--m-accent-color) transition-all duration-200"
          style="width: {OtaStore.progress}%"
        ></div>
      </div>
    </div>
  </div>
{/if}
