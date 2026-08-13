
<script lang="ts">
  import type { Component } from 'svelte';
  import { AppWindow } from '@lucide/svelte';
  import { SlideUpIn, SlideUpOut } from 'mimicortex';
  import type { OSContext } from 'mimicortex';

  interface Props {
    id: string,
    image?: string,
    icon?: Component,
    label: string,
    services: OSContext
  }

  let { id, image, icon = AppWindow, label = "app", services }: Props = $props();
</script>

<button
 in:SlideUpIn
 out:SlideUpOut
 onclick={() => services.windows.restoreApp(id)}
  style={services.windows.getFocusedApp() === id ? "background-color: var(--m-accent-color);" : ""}
 class="relative transition-colors group rounded-2xl m-foreground p-2 items-center justify-center 
 flex-col flex  cursor-pointer"
 >
  
  {#if image}
    <img
      src={image}
      alt={label}
      class="w-8 h-8 rounded-lg object-cover group-hover:scale-110 duration-300 transition-transform"
    />
  {:else}
    {@const Icon = icon}
    <Icon class="w-8 h-8 scale-60 group-hover:scale-110 duration-300 transition-transform" />
  {/if}
  <p class="text-xs absolute top-11 left-1/2 transform -translate-x-1/2 rounded-sm p-1  group-hover:scale-100 scale-0 transition-transform duration-300">{label}</p>
</button>
