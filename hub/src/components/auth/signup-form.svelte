<script lang="ts">
  import { auth } from '$lib/auth.svelte';

  let { onSuccess }: { onSuccess: () => void } = $props();

  let username = $state('');
  let email = $state('');
  let password = $state('');
  let busy = $state(false);
  let error = $state<string | null>(null);
  let successMessage = $state<string | null>(null);

  async function handleRegister() {
    if (busy) return;
    busy = true;
    error = null;
    successMessage = null;

    try {
      await auth.signUp(email.trim(), password, username.trim());
      successMessage = 'account created successfully. verify your email if required.';
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleRegister(); }}>
  <p class="m-0 text-sm text-dim">> create a developer account to publish cartridges</p>

  <label class="block">
    <span class="term-label">username</span>
    <input class="term-input" bind:value={username} autocomplete="username" placeholder="dev-name" required />
  </label>

  <label class="block">
    <span class="term-label">email</span>
    <input class="term-input" type="email" bind:value={email} autocomplete="email" placeholder="you@example.com" required />
  </label>

  <label class="block">
    <span class="term-label">password</span>
    <input class="term-input" type="password" bind:value={password} autocomplete="new-password" placeholder="••••••••" required />
  </label>

  {#if error}
    <p class="m-0 text-xs text-red">> error — {error}</p>
  {/if}

  {#if successMessage}
    <p class="m-0 text-xs text-emerald-400">> success — {successMessage}</p>
  {/if}

  <div class="mt-6 flex items-center justify-between gap-4">
    <button class="btn" type="submit" disabled={busy}>
      {busy ? 'creating…' : 'create account'}
    </button>
  </div>
</form>