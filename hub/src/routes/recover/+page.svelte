<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/auth.svelte';
  import TerminalWindow from '../../components/terminal-window.svelte';

  let password = $state('');
  let confirm = $state('');
  let busy = $state(false);
  let error = $state<string | null>(null);
  let done = $state(false);

  onMount(() => {
    auth.init();
  });

  async function handleReset() {
    if (busy) return;
    if (password.length < 6) {
      error = 'password must be at least 6 characters';
      return;
    }
    if (password !== confirm) {
      error = 'passwords do not match';
      return;
    }
    busy = true;
    error = null;
    try {
      await auth.updatePassword(password);
      done = true;
      setTimeout(() => goto('/'), 1600);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head>
  <title>Recover password — MimiOS Hub</title>
</svelte:head>

<section class="border-b border-line">
  <div class="container py-14 md:py-20">
    <TerminalWindow title="mimios@hub: ~/auth/recover">
      <div class="p-6">
        {#if !auth.ready}
          <p class="m-0 text-sm text-dim">> reading recovery session…</p>
        {:else if auth.recovering && !done}
          <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleReset(); }}>
            <p class="m-0 text-sm text-dim">> recovery token detected — set a new password</p>

            <label class="block">
              <span class="term-label">new password</span>
              <input class="term-input" type="password" bind:value={password} autocomplete="new-password" placeholder="••••••••" required />
            </label>

            <label class="block">
              <span class="term-label">confirm password</span>
              <input class="term-input" type="password" bind:value={confirm} autocomplete="new-password" placeholder="••••••••" required />
            </label>

            {#if error}
              <p class="m-0 text-xs text-red">> error — {error}</p>
            {/if}

            <div class="mt-6 flex items-center justify-end">
              <button class="btn" type="submit" disabled={busy}>
                {busy ? 'updating…' : 'update password'}
              </button>
            </div>
          </form>
        {:else if done}
          <p class="m-0 text-sm text-emerald-400">> success — password updated. redirecting to hub…</p>
        {:else}
          <p class="m-0 text-sm text-red">> no recovery token found</p>
          <a class="mt-4 inline-block text-sm text-accent hover:underline" href="/">$ cd ..</a>
        {/if}
      </div>
    </TerminalWindow>
  </div>
</section>
