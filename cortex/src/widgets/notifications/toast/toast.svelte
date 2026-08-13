<script lang="ts">
  import { onMount } from 'svelte';
  import NotificationCard from '@/widgets/notifications/shared/notifications-card.svelte';
  import { Trash } from '@lucide/svelte';
  import { BottomFadeOut, SlideUpOut } from 'mimicortex';
  import type { Notification } from '@/types/notification-types';

  let { notification }: { notification: Notification } = $props();
  let show = $state(false);

  onMount(() => {
    show = true;

    const timer = setTimeout(() => {
      show = false;
    }, 3000);

    return () => clearTimeout(timer);
  });

  const closeToast = (event: Event) => {
    event.stopPropagation();
    show = false;
  };
</script>

{#if show}
  <div class="relative" out:SlideUpOut>
    <button
      onclick={closeToast}
      class="m-button absolute top-1 right-6 z-20"
      aria-label="Dismiss notification"
    >
      <Trash />
    </button>
    <NotificationCard {...notification} useclass="m-foreground m-panel p-5" />
  </div>
{/if}
