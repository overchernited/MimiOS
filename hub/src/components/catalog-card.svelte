<script lang="ts">
  import type { CatalogItem } from '$lib/types';
  import type { CatalogSection } from '$lib/types';
  import type { Component } from 'svelte';
  import CatalogCard from './catalog-card/catalog-card.svelte';
  

  const props : CatalogSection = $props();
 
  let manifestLines = $derived((item: CatalogItem) => {
  const m = item.manifest ?? {};
  return Object.entries(m)
    .filter(([k]) => k !== 'image')
    .map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)] as const);
});
</script>

<section class=" flex flex-col gap-4 p-6" id={props.id}>
  <div class="flex flex-col gap-3 terminal-card p-5">
    <div class="flex flex-row items-center gap-1">
      <span class="grid w-7 place-items-center text-accent" aria-hidden="true">
       <props.icon/>
      </span>

      <h3 class="text-lg uppercase tracking-wider text-fg">{props.name}</h3>

      
    </div>
    <p class="m-0 border-t border-dashed border-line pt-3 text-xs text-faint">$ ls {props.name.toLowerCase()}/</p>
    <p class="m-0 text-sm text-dim">{props.description}</p>
  </div>


    <p class="text-sm text-dim">> reading catalog…</p>
    <ul class="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
      {#each 
        props.items as item
      }
        <CatalogCard kind={props.id} {...item} />
        
      {/each}
    </ul>
</section>
