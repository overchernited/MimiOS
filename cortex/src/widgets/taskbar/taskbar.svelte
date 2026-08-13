<svelte:options customElement={{tag: "taskbar-widget", shadow: 'none'}} />

<script lang="ts">

  import TaskbarIcon from "@/widgets/taskbar/taskbar-icon.svelte";
  import TaskbarChest from "@/widgets/taskbar/taskbar-chest.svelte";
  import { AppWindow, ChevronUp } from "@lucide/svelte";

  
  import type { OSContext } from 'mimicortex';
  import { flip } from "svelte/animate";

  let { services }: { services: OSContext } = $props();

  let windows = $derived(services.windows.items);

  let chestOpen = $state(false);

</script>

<section
 class="m-panel m-primary-background  relative m h-20 w-190 flex items-center p-5 gap-9 text-(--m-text-color) font-bold overflow-hidden"
 >
  {#each windows as window (window.id) }
  
  <div animate:flip={{duration: 200}}>
    <TaskbarIcon 
      services={services}
      id={window.id}
      image={window.image}
      icon={window.icon ?? AppWindow} 
      label={window.title} />
</div>
  {/each}

  <button
    onclick={() => chestOpen = true}
    class="transition-transform hover:scale-150 cursor-pointer absolute right-0 -translate-x-1/2 h-10 w-10 rounded-2xl bg-(--m-foreground-color) text-(--m-text-color) flex items-center justify-center"
  >
    <ChevronUp />
  </button>
</section>

{#if chestOpen}
  <TaskbarChest services={services} onclose={() => chestOpen = false} />
{/if}