<script lang="ts">
  import { auth } from '$lib/auth.svelte';

  let { onSuccess, onForgot }: { onSuccess: () => void; onForgot: () => void } = $props();

  let email = $state('');
  let password = $state('');
  let busy = $state(false);
  let error = $state<string | null>(null);

  async function handleLogin() {
    if (busy) return;
    busy = true;
    error = null;
    try {
      await auth.signIn(email.trim(), password);
      onSuccess();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleLogin(); }}>
  <p class="m-0 text-sm text-dim">> authenticate to manage your cartridges</p>

  <label class="block">
    <span class="term-label">email</span>
    <input class="term-input" type="email" bind:value={email} autocomplete="email" placeholder="you@example.com" required />
  </label>

  <label class="block">
    <span class="term-label">password</span>
    <input class="term-input" type="password" bind:value={password} autocomplete="current-password" placeholder="••••••••" required />
  </label>

  {#if error}
    <p class="m-0 text-xs text-red">> error — {error}</p>
  {/if}

  <div class="mt-6 flex items-center justify-between gap-4">
    <button class="btn" type="submit" disabled={busy}>
      {busy ? 'authenticating…' : 'authenticate'}
    </button>
    <button class="cursor-pointer text-xs text-dim transition-colors hover:text-accent" type="button" onclick={onForgot}>
      forgot password?
    </button>
  </div>
</form>