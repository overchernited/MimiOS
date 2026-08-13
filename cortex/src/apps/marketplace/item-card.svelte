<script lang="ts">
  import { Download, HardDriveDownload } from '@lucide/svelte';
  import { formatBytes } from '@/lib/format';

  export interface MarketplaceItem {
    id: string;
    title: string;
    description: string;
    author: string;
    version: string;
    manifest: Record<string, unknown>;
    downloads: number;
    chip?: string;
    file_size?: number;
    type?: string;
  }

  let { item, installing = false, progress = 0, onInstall }: {
    item: MarketplaceItem;
    installing?: boolean;
    progress?: number;
    onInstall?: (item: MarketplaceItem) => void;
  } = $props();

  const isCartridge = $derived(!!item.chip || !!item.file_size);

  const imageOf = (item: MarketplaceItem) =>
    (item.manifest?.image as string | undefined) ?? `https://picsum.photos/seed/${item.id}/200`;

  const formatSize = (bytes?: number) => (bytes ?? 0 ? formatBytes(bytes!) : '');
</script>

<article class="flex gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:bg-white/10">
  <div class="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/10 shadow-inner">
    <img src={imageOf(item)} alt={item.title} class="h-full w-full object-cover" loading="lazy" />
  </div>
  <div class="min-w-0 flex-1">
    <div class="flex items-center justify-between gap-2">
      <h3 class="truncate font-bold">{item.title}</h3>
      <span class="flex shrink-0 items-center gap-1 text-sm opacity-80">
        <Download class="h-4 w-4 text-(--m-accent-color)" />
        {item.downloads}
      </span>
    </div>
    <p class="text-xs opacity-70">
      {item.author} · v{item.version}
      {#if item.chip}<span class="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase">{item.chip}</span>{/if}
      {#if item.file_size}<span class="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{formatSize(item.file_size)}</span>{/if}
        {#if item.file_size}<span class="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px]">{item.type?.toLocaleUpperCase()}</span>{/if}
    </p>
    <p class="mt-1 line-clamp-2 text-sm opacity-60">{item.description}</p>

    {#if onInstall}
      <button
        onclick={() => onInstall(item)}
        disabled={installing}
        class="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-(--m-accent-color)/40 bg-(--m-accent-color)/20 px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:bg-(--m-accent-color)/35 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <HardDriveDownload class="h-4 w-4" />
        {installing ? (isCartridge ? `Installing ${progress}%` : 'Installing...') : 'Install'}
      </button>
      {#if installing && isCartridge}
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div class="h-full rounded-full bg-(--m-accent-color) transition-all duration-200" style="width: {progress}%"></div>
        </div>
      {/if}
    {/if}
  </div>
</article>
