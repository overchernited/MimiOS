<script lang="ts">
  import { SensorStore } from "@/stores/sensor.svelte";
  import { Usb } from "@lucide/svelte";
  import { screen } from "@/lib/transitions";
</script>

<div class="fixed inset-0 flex items-center justify-center" transition:screen>
  <div
    class="m-panel m-primary-background flex w-[90vh] h-[50vh] flex-col items-center justify-center gap-5 p-8 text-(--m-text-color)"
  >
    <div
      class="flex h-28 w-28 items-center justify-center rounded-full border border-(--m-accent-color)/40 bg-(--m-accent-color)/10"
    >
      <Usb class="w-16 h-16 text-(--m-text-color)" strokeWidth={1.5} />
    </div>

    <h1 class="montserrat text-4xl md:text-5xl 2xl:text-6xl font-bold tracking-wide">Mimi OS</h1>

    <p class="flex items-center gap-3 text-base xl:text-xl font-semibold">
      {#if SensorStore.connected}
        Master connected
      {:else}
        Connect your ESP32 to continue
      {/if}
    </p>
  </div>
</div>
