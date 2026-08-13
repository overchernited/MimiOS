<svelte:options customElement={{ tag: "toast-widget", shadow: 'none' }} />

<script lang="ts">
  import { flip } from 'svelte/animate';
  import ToastItem from '@/widgets/notifications/toast/toast.svelte';
  import type { OSContext } from 'mimicortex';

  let { services }: { services: OSContext } = $props();

  let items = $derived(services.notifications.items.slice(-2));
</script>

<section class="pointer-events-none z-50 m-2 flex w-150 max-w-[calc(100vw-1rem)] flex-col-reverse gap-1 justify-start">
  {#each items as notification (notification.id)}
    <div class="pointer-events-auto" animate:flip={{ duration: 200 }}>
      <ToastItem {notification} />
    </div>
  {/each}
</section>
