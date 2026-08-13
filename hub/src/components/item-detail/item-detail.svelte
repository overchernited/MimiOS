<script lang="ts">
  import { onMount } from 'svelte';
  import type { CatalogItem } from '$lib/types';
  import type { CatalogKind } from '$lib/marketplace';
  import { catalogDownloadUrl } from '$lib/marketplace';
  import { usernameFor } from '$lib/profiles';
  import { ArrowLeft, Download, GitBranch } from '@lucide/svelte';
  import ItemMeta from './item-meta.svelte';
  import Manifest from './manifest.svelte';

  let { kind, item }: { kind: CatalogKind; item: CatalogItem } = $props();

  let authorProfile = $state<string | null>(null);

  const imageOf = $derived((item.img as string | undefined)?.trim() || `https://picsum.photos/seed/${item.id}-icon/800`);
  const published = $derived(item.created_at ? new Date(item.created_at).toLocaleDateString() : null);
  const downloadUrl = $derived(catalogDownloadUrl(item));

  onMount(() => {
    if (!item.user_id) return;
    void usernameFor(item.user_id).then((name) => {
      authorProfile = name;
    });
  });
</script>

<section class="border-b border-line">
  <div class="container py-14 md:py-20">
    <a
      class="mb-8 inline-flex items-center gap-2 text-sm text-dim transition-colors hover:text-accent hover:no-underline"
      href="/#catalog"
    >
      <ArrowLeft size={16} /> $ cd ..
    </a>

    <div class="grid items-start gap-10 md:grid-cols-[0.9fr_1.1fr]">
      <div class="min-w-0">
        <p class="m-0 mb-3 text-xs text-faint">$ cat /hub/{kind}/{item.id}.png</p>
        <img
          src={imageOf}
          alt={`${item.title} preview`}
          class="aspect-square w-full rounded-xl border border-line bg-soft object-cover"
        />
      </div>

      <div>
        <p class="m-0 mb-2 text-xs uppercase tracking-[0.2em] text-accent">$ {kind}/{item.id}</p>
        <h1 class="text-3xl leading-tight md:text-5xl">
          {item.title}
          <span class="ml-2 text-base font-normal text-dim">v{item.version}</span>
        </h1>
        <p class="m-0 mt-2 text-sm text-dim">
          by {item.author}
          {#if authorProfile && authorProfile !== item.author}
            · <a href={`/profile/${authorProfile}`} class="text-accent hover:underline">~ {authorProfile}</a>
          {/if}
        </p>
        <p class="m-0 mt-6 max-w-xl text-base leading-relaxed text-fg">{item.description}</p>

        <ItemMeta {kind} {item} {published} />

        <div class="mt-8 flex flex-wrap gap-3">
          {#if kind === 'cartridges' && downloadUrl}
            <a 
              class="btn inline-flex items-center gap-2" 
              href={downloadUrl} 
              download="{item.id}.bin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={16} /> download .bin
            </a>
          {/if}
          {#if item.url}
            <a class="btn" href={item.url} target="_blank" rel="noopener noreferrer">
              <GitBranch size={16} /> view on github
            </a>
          {/if}
          <a class="btn btn-ghost" href="/#catalog">browse catalog</a>
        </div>
      </div>
    </div>
  </div>
</section>

{#if item.manifest}
  <section class="border-b border-line">
    <div class="container py-14 md:py-20">
      <h2 class="section-title">manifest</h2>
      <Manifest {kind} {item} />
    </div>
  </section>
{/if}