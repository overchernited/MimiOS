<script lang="ts">
  import type { CatalogItem } from '$lib/types';
  import type { CatalogKind } from '$lib/marketplace';
  import { formatBytes } from '$lib/marketplace';

  let { kind, item, published }: { kind: CatalogKind; item: CatalogItem; published: string | null } = $props();


</script>

<div class="terminal-card mt-8 p-6">
  <p class="m-0 mb-4 text-xs text-faint">$ info {item.id} --json</p>
  <ul class="m-0 list-none *:m-2 p-0 text-sm text-dim">
    <li>
       kind — <span class="chip-tag chip-green">{kind}</span>
    </li>
    <li>
      version — <span class="text-fg chip-tag chip-yellow">{item.version}</span>
    </li>
      <li>
        author — <span class={`chip-tag chip-purple`}>{item.author}</span>
      </li>
    {#if item.chip}
      <li>
        chip — <span class={`chip-tag chip-blue`}>{item.chip}</span>
      </li>
    {/if}
    {#if item.file_size}
      <li>
        size — <span class="chip-tag chip-red">{formatBytes(item.file_size)}</span>
      </li>
    {/if}
    {#if item.downloads != null}
      <li>
        downloads — <span class="chip-tag chip-cyan">{item.downloads}</span>
      </li>
    {/if}
    {#if published}
      <li>
        published — <span class="chip-tag chip-slate">{published}</span>
      </li>
    {/if}
  </ul>
</div>