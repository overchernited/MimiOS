<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { marketplace, CATALOG_KINDS } from '$lib/marketplace';
  import type { CatalogKind } from '$lib/marketplace';
  import type { CatalogItem } from '$lib/types';
  import ItemDetail from '../../../../components/item-detail/item-detail.svelte';
  import { ArrowLeft } from '@lucide/svelte';

  const kind = $derived(page.params.kind as CatalogKind);
  const id = $derived(page.params.id ?? '');

  let item: CatalogItem | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  onMount(async () => {
    try {
      if (!CATALOG_KINDS.includes(kind)) throw new Error(`unknown kind: ${kind}`);
      const entry = await marketplace.get(kind, id);
      if (!entry) throw new Error(`not found: ${id}`);
      item = entry as unknown as CatalogItem;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{item ? `${item.title} — MimiOS Hub` : `${kind} — MimiOS Hub`}</title>
</svelte:head>

{#if loading}
  <div class="container py-24">
    <p class="text-sm text-dim">> reading catalog…</p>
  </div>
{:else if error}
  <div class="container flex flex-col items-start gap-6 py-24">
    <p class="m-0 text-sm text-red">> {error}</p>
    <a class="btn btn-ghost" href="/#catalog"><ArrowLeft size={16} /> back to catalog</a>
  </div>
{:else if item}
  <ItemDetail kind={kind} item={item} />
{/if}
