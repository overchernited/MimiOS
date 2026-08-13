<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/auth.svelte';
  import { usernameFor } from '$lib/profiles';
  import AuthModal from './auth/auth-modal.svelte';
  import UploadModal from './upload/upload-modal.svelte';

  let authOpen = $state(false);
  let uploadOpen = $state(false);
  let username = $state<string | null>(null);

  function closeOnLinkClick(node: HTMLElement) {
    const handler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) {
        (node as HTMLDetailsElement).open = false;
      }
    };
    node.addEventListener('click', handler);
    return { destroy: () => node.removeEventListener('click', handler) };
  }

  onMount(() => {
    auth.init();
  });

  $effect(() => {
    const user = auth.user;
    username = null;
    if (!user) return;
    void usernameFor(user.id).then((name) => {
      if (auth.user?.id === user.id) username = name;
    });
  });
</script>

<header class="w-full  md:justify-center items-center flex  sticky top-0 z-40 border-b border-line bg-pitch/85 backdrop-blur">
  <div class="md:w-[70%] flex w-full justify-between px-5 py-1 md:justify-center h-14 gap-6">
    <a href="/" class="flex items-center gap-2 text-base font-bold text-fg hover:no-underline">
      <span class="font-bold text-accent">$</span>
      <span>mimios@hub<span class="cursor text-accent">█</span></span>
    </a>

    <nav class="ml-auto hidden items-center gap-1 md:flex" aria-label="Sections">
      <a class="rounded-md px-3 py-2 text-sm text-dim transition-colors hover:bg-accent/5 hover:text-accent hover:no-underline" href="/#firmware">firmware</a>
      <a class="rounded-md px-3 py-2 text-sm text-dim transition-colors hover:bg-accent/5 hover:text-accent hover:no-underline" href="/#widgets">widgets</a>
      <a class="rounded-md px-3 py-2 text-sm text-dim transition-colors hover:bg-accent/5 hover:text-accent hover:no-underline" href="/#apps">apps</a>
      <a class="rounded-md px-3 py-2 text-sm text-dim transition-colors hover:bg-accent/5 hover:text-accent hover:no-underline" href="/#cartridges">cartridges</a>
      <a class="rounded-md px-3 py-2 text-sm text-dim transition-colors hover:bg-accent/5 hover:text-accent hover:no-underline" href="/#how">how-to</a>
    </nav>

    <div class="ml-auto hidden items-center gap-7 md:flex flex">
      {#if !auth.ready}
        <span class="text-xs text-faint">> loading session…</span>
      {:else if auth.user}
        <button class="btn btn-ghost" onclick={() => (uploadOpen = true)}>
          ↑ upload
        </button>
        {#if username}
          <a href={`/profile/${username}`}>
            ~ {username}
          </a>
        {/if}
        <button class="rounded-md px-2 py-1.5 text-xs text-faint transition-colors hover:text-red" onclick={() => void auth.signOut()}>
          logout
        </button>
      {:else}
        <button class="btn  text-xs" onclick={() => (authOpen = true)}>
          login
        </button>
      {/if}
    </div>

    <details class="md:hidden" use:closeOnLinkClick>
      <summary
        class="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-md border border-line text-xl leading-none text-accent [&::-webkit-details-marker]:hidden"
        aria-label="Toggle menu"
      >
        <span class="open:hidden" aria-hidden="true">≡</span>
        <span class="hidden open:block" aria-hidden="true">×</span>
      </summary>
      <nav id="mobile-nav" class="fixed inset-x-0 top-14 flex flex-col border-b border-line bg-pitch px-6 pb-3 md:hidden" aria-label="Sections">
        <a class="border-b border-dashed border-line py-3 text-sm text-dim" href="/#firmware">firmware</a>
        <a class="border-b border-dashed border-line py-3 text-sm text-dim" href="/#widgets">widgets</a>
        <a class="border-b border-dashed border-line py-3 text-sm text-dim" href="/#apps">apps</a>
        <a class="border-b border-dashed border-line py-3 text-sm text-dim" href="/#cartridges">cartridges</a>
        <a class="border-b border-dashed border-line py-3 text-sm text-dim" href="/#how">how-to</a>
        {#if auth.user}
          <button
            class="border-b border-dashed border-line py-3 text-left text-sm text-accent"
            onclick={() => (uploadOpen = true)}
          >↑ upload </button>
          {#if username}
            <a class="border-b border-dashed border-line py-3 text-sm text-accent" href={`/profile/${username}`}>~ {username}</a>
          {/if}
          <button class="py-3 text-left text-sm text-faint" onclick={() => void auth.signOut()}>logout</button>
        {:else}
          <button class="py-3 text-left text-sm text-accent" onclick={() => (authOpen = true)}>login</button>
        {/if}
      </nav>
    </details>
  </div>
</header>

<AuthModal open={authOpen} onclose={() => (authOpen = false)} />
<UploadModal open={uploadOpen} onclose={() => (uploadOpen = false)} />
