<script lang="ts">
  import WidgetRenderer from '@/components/widgetsRenderer/widget-renderer.svelte';
  import WindowsRenderer from '@/components/windowManager/windows-renderer.svelte';
  import Login from '@/components/login/login.svelte';
  import Connect from '@/components/connect/connect.svelte';
  import OtaOverlay from '@/components/ota/ota-overlay.svelte';
  import { WidgetStore } from '@/stores/widgets.svelte';
  import { WindowStore } from '@/stores/windows.svelte';
  import { SensorStore } from '@/stores/sensor.svelte';
  import { StorageStore } from '@/stores/storage.svelte';

  import 'melanin/theme.css';
  import { AuthStore } from '@/stores/auth.svelte';
  import { screen } from '@/lib/transitions';
  import ApiCheck from '@/components/dev/api-check.svelte';
  const wallpaper = $derived(String(StorageStore.get('desktopWallpaper') ?? ''));
  const isVideo = $derived(/\.mp4$/i.test(wallpaper));
</script>

{#if !SensorStore.connected}
  <Connect />
{:else if !AuthStore.authenticated}
  <Login />
{:else}
<main
  style={!isVideo && wallpaper ? `background-image: url('${wallpaper}'); background-size: cover; background-position: center;` : ''}
  class="relative h-full w-full desktop-grid"
  transition:screen
>
  {#if isVideo}
    <video
      class="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
      src={wallpaper}
      autoplay
      muted
      loop
      playsinline
      preload="auto"
    ></video>
  {/if}
  {#each WidgetStore.items as widget (widget.id)}
    <WidgetRenderer data={widget} />
  {/each}
  {#each WindowStore.items as window (window.id)}
    <WindowsRenderer data={window} />
  {/each}
</main>
{/if}

<OtaOverlay />

<!-- <ApiCheck /> -->
