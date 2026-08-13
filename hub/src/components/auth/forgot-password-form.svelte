<script lang="ts">
  import { auth } from '$lib/auth.svelte';

  let { onBack}: { onBack: () => void;} = $props();

  let email = $state('');
  let busy = $state(false);
  let error = $state<string | null>(null);
  let sent = $state(false);

  async function handleRequest() {
    if (busy) return;
    busy = true;
    error = null;
    try {
      await auth.resetPassword(email.trim());
      sent = true;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleRequest(); }}>
  <p class="m-0 text-sm text-dim">> we'll email you a link to reset your password</p>

  <label class="block">
    <span class="term-label">email</span>
    <input class="term-input" type="email" bind:value={email} autocomplete="email" placeholder="you@example.com" required />
  </label>

  {#if error}
    <p class="m-0 text-xs text-red">> error — {error}</p>
  {/if}

  {#if sent}
    <p class="m-0 text-xs text-emerald-400">> success — reset link sent. check your inbox (and spam).</p>
  {/if}

  <div class="mt-6 flex items-center justify-between gap-4">
    <button class="btn" type="submit" disabled={busy || sent}>
      {busy ? 'sending…' : 'send reset link'}
    </button>
    <button class="text-xs text-dim transition-colors hover:text-accent" type="button" onclick={onBack}>
      $ back to login
    </button>
  </div>
</form>
