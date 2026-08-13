<script lang="ts">
  import { Check, Pencil } from '@lucide/svelte';
  import { StorageStore } from '@/stores/storage.svelte';
  import { NotificationStore } from '@/stores/notifications.svelte';

  let wallpaperUrl = $state(String(StorageStore.get('desktopWallpaper') ?? ''));
  let saved = $state(false);

  const isVideo = (url: string) => /\.mp4$/i.test(url);

  function applyWallpaper() {
    const url = wallpaperUrl.trim();
    if (!url) return;

    StorageStore.set('desktopWallpaper', url);
    saved = true;
    setTimeout(() => (saved = false), 2000);

    NotificationStore.add({
      id: crypto.randomUUID(),
      title: 'Settings',
      message: 'Wallpaper saved',
      process: 'Cortex',
      color: '#35E4FF',
      timestamp: Date.now(),
    });
  }
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-6 justify-centeri items-center text-center">
  <div>
    <h2 class="montserrat text-xl font-bold">Wallpaper</h2>
    <p class="mt-1 text-sm opacity-70">Paste a URL to an image or an mp4 video.</p>
  </div>

  <input
    bind:value={wallpaperUrl}
    placeholder="https://example.com/wallpaper.png or /video.mp4"
    class="m-input w-full"
  />

  <button onclick={applyWallpaper} disabled={!wallpaperUrl.trim()} class="m-button w-[70%] disabled:opacity-50 flex justify-between flex-row-reverse items-center">
    {#if saved}
      <Check class="h-4 w-4" />
    {:else}
      <Pencil class="h-4 w-4" />
    {/if}
    {saved ? 'Saved' : 'Apply'}
  </button>

  <div class="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40">
    {#if wallpaperUrl}
      {#if isVideo(wallpaperUrl)}
        <video
          src={wallpaperUrl}
          autoplay
          muted
          loop
          playsinline
          class="h-full w-full object-cover"
        ></video>
      {:else}
        <img src={wallpaperUrl} alt="Wallpaper preview" class="h-full w-full object-cover" loading="lazy" />
      {/if}
    {:else}
      <p class="text-sm opacity-40">Enter a URL to preview</p>
    {/if}
  </div>
</div>
