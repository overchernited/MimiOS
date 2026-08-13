<svelte:options customElement={{tag: "config-app", shadow: 'none'}} />

<script lang="ts">
  import { configViews } from './views';
  import { OS } from '@/lib/services';

  let tab = $state(Object.keys(configViews)[0]);
  const active = $derived(configViews[tab]);

  const tabClass = (id: string) => `flex w-full cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
    tab === id ? 'border-(--m-accent-color) bg-(--m-accent-color)/25' : 'border-transparent bg-white/5 opacity-70 hover:opacity-100'
  }`;
</script>

<section class="m-background flex h-full w-full overflow-hidden text-(--m-text-color)">
  <nav class="flex w-44 shrink-0 flex-col gap-2 overflow-y-auto border-r border-white/10 p-4">
    {#each Object.entries(configViews) as [id, view] (id)}
      <button onclick={() => tab = id} class={tabClass(id)}>
        {#if view.icon}
          {@const Icon = view.icon}
          <Icon class="h-4 w-4 shrink-0 text-(--m-accent-color)" />
        {/if}
        {view.label}
      </button>
    {/each}
  </nav>

  {#if active}
    {@const View = active.component}
    <div class="flex min-h-0 flex-1 flex-col">
      <View services={OS} />
    </div>
  {/if}
</section>
