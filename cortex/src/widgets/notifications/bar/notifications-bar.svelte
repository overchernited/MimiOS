<svelte:options customElement={{tag: "notifications-widget", shadow: 'none'}} />

<script lang="ts">
  import gsap from "gsap";
  import { Trash, Bell, BellDot} from '@lucide/svelte';
  import NotificationCard from '@/widgets/notifications/shared/notifications-card.svelte';
  import NotificationsIcon from '@/widgets/notifications/bar/notifications-icon.svelte';
  import { BellVibrate } from 'mimicortex';

  import type { OSContext } from 'mimicortex';

  let { services }: { services: OSContext } = $props();

  let items = $derived(services.notifications.items);
  let isOpened: boolean = $state(false);
  let NotificationBar: HTMLElement | undefined = $state();
  let bellElement: HTMLElement | undefined = $state();
  let previousCount: number = $state(0);

  $effect(() => {
    if (NotificationBar) {
      gsap.to(NotificationBar, {
        height: isOpened ? "80%" : "0%",
        opacity: isOpened ? 1 : 0,
        duration: 0.3,
        ease: "power3.out(0.5)",
      });
    }
  });

  $effect(() => {
    const currentCount = items.length;
    if (currentCount > previousCount && bellElement) {
      BellVibrate(bellElement);
    }
    previousCount = currentCount;
  });

  
  const handleClear = () => {
    services.notifications.clear();
  };

  const OpenNotifications = () => {
    isOpened = !isOpened;
  };
</script>

<div class="h-full w-full flex flex-col items-center gap-2 shrink-0 z-20">
  
  <button
    onclick={OpenNotifications} 
    aria-label="NotificationsBar"
    class="m-panel m-primary-background m w-full h-[8%] flex items-center p-5 gap-9 text-(--m-text-color) font-bold overflow-hidden"
  >
    <h2 bind:this={bellElement} class="montserrat" style="transform-origin: top center">
      {#if items.length > 0}
        <BellDot/>
      {:else}
        <Bell/>
      {/if}
    </h2>
    {#if !isOpened}
      {#each items as notification (notification.id)}
        <NotificationsIcon 
          color={notification.color} 
          title={notification.title} 
        />
      {/each}
    {/if}
  </button>

  <section bind:this={NotificationBar} class="m-panel m-primary-background h-[90%] w-full overflow-auto overflow-x-hidden">
    {#each items as notification}
      <NotificationCard {...notification}/>
    {:else}
      <div class="h-full w-full flex items-center justify-center text-(--m-text-color) font-bold">
        <p>No notifications.</p>
      </div>
    {/each}
  </section>

  {#if isOpened}
  <button class="m-button" onclick={handleClear}>
    <Trash/>
  </button>
  {/if}

</div>