<svelte:options customElement={{tag: "marketplace-app", shadow: 'none'}} />

<script lang="ts">
  import { marketplace, fetchBin } from '@/lib/marketplace/marketplace';
  import { AppWindow, Cpu, Puzzle } from '@lucide/svelte';
  import ItemCard, { type MarketplaceItem } from './item-card.svelte';
  import { send, sendBinary, wsBufferedAmount } from '@/services/ws.svelte';
  import { NotificationStore } from '@/stores/notifications.svelte';
  import { StorageStore } from '@/stores/storage.svelte';
  import { OtaStore } from '@/stores/ota.svelte';
  import type { AppDescriptor } from '@/types/preferences.type';
  import type { WidgetInterface as Widget } from '@/components/widgetsRenderer/types';
  import OtaPassword from './ota-password.svelte';

  type Category = 'apps' | 'widgets' | 'cartridges';

  const CHUNK_SIZE = 8 * 1024;
  const MAX_BUFFER = 256 * 1024;

  const categories: { id: Category; label: string; icon: typeof AppWindow }[] = [
    { id: 'apps', label: 'Apps', icon: AppWindow },
    { id: 'widgets', label: 'Widgets', icon: Puzzle },
    { id: 'cartridges', label: 'Cartridges', icon: Cpu },
  ];

  let active: Category = $state('apps');
  let items: Record<Category, MarketplaceItem[]> = $state({ apps: [], widgets: [], cartridges: [] });
  let loading = $state(true);
  let error = $state('');
  let pendingAuth = $state<MarketplaceItem | null>(null);

  $effect(() => {
    loading = true;
    error = '';
    Promise.all([marketplace.list('apps'), marketplace.list('widgets'), marketplace.list('cartridges')])
      .then(([apps, widgets, cartridges]) => {
        items = { apps, widgets, cartridges };
        loading = false;
      })
      .catch((err: unknown) => {
        error = String(err instanceof Error ? err.message : err);
        loading = false;
      });
  });

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  const isCartridge = (item: MarketplaceItem) => !!item.chip || !!item.file_size;

  const toAppDescriptor = (item: MarketplaceItem): AppDescriptor => {
    const m = item.manifest ?? {};
    return {
      id: item.id,
      title: item.title,
      applicationTag: (m.application_tag as string) ?? `${item.id}-app`,
      sourceUrl: (m.source_url as string) ?? `/src/apps/${item.id}/${item.id}.svelte`,
      image: m.image as string | undefined,
      size: m.size as AppDescriptor['size'],
    };
  };

  const toWidgetDescriptor = (item: MarketplaceItem): Widget => {
    const m = item.manifest ?? {};
    return {
      tagName: (m.tag_name as string) ?? `${item.id}-widget`,
      gridPosition: {
        col: (m.col as number) ?? 1,
        row: (m.row as number) ?? 1,
        spanCol: (m.span_col as number) ?? 4,
        spanRow: (m.span_row as number) ?? 4,
      },
    };
  };

  function registerInPrefs(item: MarketplaceItem) {
    if (isCartridge(item)) {
      const installed = (StorageStore.get('cartridges') as unknown as Record<string, unknown>[] | undefined) ?? [];
      if (installed.some((c) => (c as { id?: string }).id === item.id)) return;
      StorageStore.set('cartridges', [...installed, { id: item.id, title: item.title, ...item.manifest }]);
      return;
    }

    const m = item.manifest ?? {};
    if ('application_tag' in m || 'applicationTag' in m) {
      if (StorageStore.apps.some((a) => a.id === item.id)) return;
      StorageStore.set('apps', [...StorageStore.apps, toAppDescriptor(item)]);
    } else {
      const tag = (m.tag_name as string) ?? `${item.id}-widget`;
      if (StorageStore.widgets.some((w) => w.tagName === tag)) return;
      StorageStore.set('widgets', [...StorageStore.widgets, toWidgetDescriptor(item)]);
    }
  }

  function notify(message: string, color = '#35E4FF') {
    NotificationStore.add({
      id: crypto.randomUUID(),
      title: 'Marketplace',
      message,
      process: 'Cortex',
      color,
      timestamp: Date.now(),
    });
  }

  async function install(item: MarketplaceItem) {
    if (OtaStore.active) return;
    if (isCartridge(item)) {
      pendingAuth = item;
      return;
    }
    registerInPrefs(item);
    notify(`${item.title} installed on device`);
  }

  async function flashCartridge(item: MarketplaceItem) {
    OtaStore.start(item.id, item.title);
    try {
      OtaStore.downloading();
      const bin = await fetchBin(item);
      await marketplace.incrementDownloads('cartridges', item.id);

      OtaStore.flashing();
      send({ cmd: 'ota_start', file_size: bin.byteLength });
      send({ cmd: 'set_cartridge', name: item.title, version: item.version });
      send({ cmd: 'set_preference', key: 'cartridge_version', value: item.version });

      for (let offset = 0; offset < bin.byteLength; offset += CHUNK_SIZE) {
        while (wsBufferedAmount() > MAX_BUFFER) await sleep(50);
        sendBinary(bin.slice(offset, offset + CHUNK_SIZE));
        OtaStore.setProgress(((offset + CHUNK_SIZE) / bin.byteLength) * 100);
      }
      send({ cmd: 'ota_end' });
    } catch (err) {
      notify(`Install failed: ${err instanceof Error ? err.message : String(err)}`, '#FF6D6B');
      OtaStore.finish();
    }
  }
</script>

<section class="m-background flex h-full w-full flex-col overflow-hidden p-5 text-(--m-text-color)">
  <div class="mb-4 flex flex-wrap items-center gap-3">
    {#each categories as category}
      <button
        onclick={() => active = category.id}
        class="flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-all duration-200
          {active === category.id
            ? 'border-(--m-accent-color) bg-(--m-accent-color)/25 shadow-lg'
            : 'border-white/15 bg-white/5 opacity-70 hover:opacity-100'}"
      >
        <category.icon class="h-4 w-4 text-(--m-accent-color)" />
        {category.label}
        <span class="rounded-full bg-white/10 px-2 text-xs">{items[category.id].length}</span>
      </button>
    {/each}
  </div>

  <div class="min-h-0 flex-1 overflow-y-auto pr-1">
    {#if loading}
      <p class="py-10 text-center text-sm opacity-60">Loading marketplace...</p>
    {:else if error}
      <p class="py-10 text-center text-sm text-(--m-red-color)">Error: {error}</p>
    {/if}
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        {#each items[active] as item (item.id)}
          <ItemCard {item} installing={OtaStore.active && OtaStore.itemId === item.id} progress={OtaStore.progress} onInstall={install} />
        {/each}
      </div>
  </div>
</section>

{#if pendingAuth}
  <OtaPassword
    item={pendingAuth}
    onConfirm={() => {
      const item = pendingAuth;
      pendingAuth = null;
      if (item) flashCartridge(item);
    }}
    onCancel={() => (pendingAuth = null)}
  />
{/if}
