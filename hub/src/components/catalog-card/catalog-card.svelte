<script lang="ts">
  import type { CatalogItem } from "$lib/types";
  import { formatBytes } from "$lib/marketplace";

  let { kind, ...item }: { kind: string } & CatalogItem = $props();

  const fallbackImage = $derived(`https://picsum.photos/seed/${item.id}-icon/200`);

  const imageOf = (it: CatalogItem) => (it.img as string | undefined)?.trim() || fallbackImage;
</script>

<li class="rounded-lg border terminal-card blue p-5">
  <div class="flex items-center gap-3">
    <a
      href={`/item/${kind}/${item.id}`}
      class="flex min-w-0 flex-1 items-center gap-3 hover:no-underline"
    >
      <img
        src={imageOf(item)}
        alt=""
        class="h-10 w-10 shrink-0 rounded-md border border-line bg-soft object-cover"
        loading="lazy"
      />
      <div class="min-w-0 flex-1">
        <p class="m-0 truncate text-2xl font-bold text-fg hover:underline">{item.title}</p>
        <p class="m-0 truncate text-sm text-fg">
        {item.author}
        <span class="chip-tag chip-yellow">
          v{item.version}
        </span>
          {#if item.chip}<span
              class="chip-blue chip-tag"
              >{item.chip}</span
            >{/if}
          {#if item.file_size}<span
              class="chip-red chip-tag"
              >{formatBytes(item.file_size)}</span
            >{/if}
            {#if item.file_size}<span
              class="chip-green chip-tag"
              >{item.type.toUpperCase()}</span
            >{/if}
        </p>
        <p class="m-0 text-sm text-dim">{item.description}</p>
      </div>
    </a>
    {#if item.url}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        class="shrink-0 text-sm text-accent hover:underline"
      >
        github ↗
      </a>
    {/if}
  </div>
</li>
