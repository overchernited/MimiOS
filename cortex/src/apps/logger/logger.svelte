<svelte:options customElement={{tag: "logger-app", shadow: 'none'}} />

<script lang="ts">


    import type { OSContext } from 'mimicortex';

  let { services }: { services: OSContext } = $props();

  let items = $derived(services.logs.items);

</script>

<section class="bg-black p-4 overflow-auto h-full w-full flex flex-col text-white">
     {#each items as log (log.id)}
      <div class="mb-1 text-sm">{log.message}</div>
    {/each}
    
    
</section>