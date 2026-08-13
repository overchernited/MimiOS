<script lang="ts">
  import type { OSContext } from "mimicortex";
  import { PopIn, PopOut } from "mimicortex";
  import { LayoutGrid, Search, X } from "@lucide/svelte";
  import type { AppDescriptor } from "@/types/preferences.type";

  interface Props {
    services: OSContext;
    onclose: () => void;
  }

  let { services, onclose }: Props = $props();

  let query = $state("");

  const filtered = $derived(
    query.trim() === ""
      ? services.storage.apps
      : services.storage.apps.filter(
          (app) =>
            app.title.toLowerCase().includes(query.toLowerCase()) ||
            app.id.toLowerCase().includes(query.toLowerCase())
        )
  );

  const launch = (app: AppDescriptor) => {
    services.windows.openApp({
      title: app.title,
      image: app.image,
      applicationTag: app.applicationTag,
      sourceUrl: app.sourceUrl,
      size: app.size
    });
    onclose();
  };
</script>

<button
  class="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-sm"
  aria-label="Close"
  onclick={onclose}
></button>

<div
  in:PopIn
  out:PopOut
  class="m-panel m-background fixed left-1/2 top-1/2 z-50 w-[min(90vw,26rem)] max-h-[75vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden border border-white/10 bg-(--m-foreground-color)/90 p-6 text-(--m-text-color) shadow-2xl backdrop-blur-xl"
>
  <div class="mb-5 flex items-center justify-between">
    <h3 class="montserrat flex items-center gap-2 text-xl font-bold tracking-wide">
      <LayoutGrid class="h-5 w-5 text-(--m-accent-color)" strokeWidth={2.5} />
      Applications
    </h3>
    <button
      onclick={onclose}
      class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-white/10"
      aria-label="Close launcher"
    >
      <X class="h-5 w-5" strokeWidth={2} />
    </button>
  </div>

  <div class="relative mb-5">
    <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" strokeWidth={2.5} />
    <input
      bind:value={query}
      placeholder="Search applications..."
      class="m-input w-full pl-11"
    />
  </div>

  {#if filtered.length === 0}
    <p class="py-10 text-center text-sm opacity-60">No applications</p>
  {:else}
    <div class="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto pr-1">
      {#each filtered as app (app.id)}
        <button
          onclick={() => launch(app)}
          class="group flex cursor-pointer flex-col items-center gap-2 rounded-2xl p-3 transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:shadow-lg"
        >
          <div class="h-16 w-16 overflow-hidden rounded-2xl bg-white/10 shadow-inner transition-transform duration-200 group-hover:scale-105">
            <img src={app.image} alt={app.title} class="h-full w-full object-cover" />
          </div>
          <span class="text-center text-xs font-semibold opacity-80 transition-colors group-hover:opacity-100">
            {app.title}
          </span>
        </button>
      {/each}
    </div>
  {/if}
</div>
