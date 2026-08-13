<script lang="ts">
  import { Key } from '@lucide/svelte';
  import { AuthStore } from '@/stores/auth.svelte';
  import { SlideUpIn } from 'mimicortex';
  import { screen } from '@/lib/transitions';
  import type { MarketplaceItem } from './item-card.svelte';

  let { item, onConfirm, onCancel }: {
    item: MarketplaceItem;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();

  let username = $state('');
  let password = $state('');
  let error = $state('');

  const submit = async () => {
    error = '';
    const valid = await AuthStore.checkAuth(username, password);
    if (!valid) {
      error = 'Invalid credentials';
      return;
    }
    onConfirm();
  };
</script>

<div class="fixed inset-0 z-100 m-background flex items-center justify-center" transition:screen>
      {#if error}
        <p
          in:SlideUpIn
          class="absolute top-0 left-1/2 m-10 -translate-x-1/2 rounded-full px-4 py-1 text-center text-sm font-semibold bg-(--m-red-color) shadow-lg"
        >
          {error}
        </p>
      {/if}
  <form
    onsubmit={(e) => {
      e.preventDefault();
      submit();
    }}
    class="m-panel m-primary-background relative flex h-[50vh] w-[90vh] flex-col items-center justify-center gap-5 p-8 text-(--m-text-color)"
  >

      <Key class="h-16 w-16 text-(--m-text-color)" strokeWidth={1.5} />

    <h1 class="montserrat text-4xl font-bold tracking-wide md:text-5xl 2xl:text-6xl">Confirm OTA</h1>
    <p class="flex items-center gap-2 text-base font-semibold xl:text-xl">
      Enter your password to flash
      <span class="text-(--m-accent-color)">{item.title}</span>
    </p>

    <label class="flex flex-col gap-1 text-sm font-semibold">
      Username
      <input bind:value={username} autocomplete="username" placeholder="admin" class="m-input w-80" />
    </label>

    <label class="flex flex-col gap-1 text-sm font-semibold">
      Password
      <input
        bind:value={password}
        type="password"
        autocomplete="current-password"
        placeholder="••••••••"
        class="m-input w-80"
      />
    </label>

    <div class="flex gap-3">
      <button type="button" onclick={onCancel} class="m-button px-6 opacity-80">
        Cancel
      </button>
      <button type="submit" disabled={AuthStore.pending} class="m-button px-6 disabled:opacity-50">
        {AuthStore.pending ? 'Verifying...' : 'Confirm'}
      </button>
    </div>
  </form>
</div>
