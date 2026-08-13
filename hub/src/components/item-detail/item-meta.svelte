<script lang="ts">
  import type { CatalogItem } from '$lib/types';
  import type { CatalogKind } from '$lib/marketplace';
  import { formatBytes } from '$lib/marketplace';

  let { kind, item, published }: { kind: CatalogKind; item: CatalogItem; published: string | null } = $props();
</script>

<div class="terminal-card mt-8 p-6">
  <p class="m-0 mb-4 text-xs text-faint">$ info {item.id} --json</p>
  <ul class="m-0 list-none space-y-2 p-0 text-sm text-dim">
    <li><span class="text-accent">✓</span> kind — <span class="text-fg">{kind}</span></li>
    <li><span class="text-accent">✓</span> id — <span class="text-fg">{item.id}</span></li>
    <li><span class="text-accent">✓</span> version — <span class="text-fg">{item.version}</span></li>
    <li><span class="text-accent">✓</span> author — <span class="text-fg">{item.author}</span></li>
    {#if item.chip}
      <li><span class="text-accent">✓</span> chip — <span class="text-fg">{item.chip}</span></li>
    {/if}
    {#if item.file_size}
      <li><span class="text-accent">✓</span> size — <span class="text-fg">{formatBytes(item.file_size)}</span></li>
    {/if}
    {#if item.downloads != null}
      <li><span class="text-accent">✓</span> downloads — <span class="text-fg">{item.downloads}</span></li>
    {/if}
    {#if published}
      <li><span class="text-accent">✓</span> published — <span class="text-fg">{published}</span></li>
    {/if}
  </ul>
</div>
