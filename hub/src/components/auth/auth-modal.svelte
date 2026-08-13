<script lang="ts">
  import { fly } from 'svelte/transition';
  import { prefersReducedMotion } from 'svelte/motion';
  import Modal from '../modal/modal.svelte';
  import LoginForm from './login-form.svelte';
  import RegisterForm from './signup-form.svelte';
  import ForgotPasswordForm from './forgot-password-form.svelte';

  let { open, onclose }: { open: boolean; onclose: () => void } = $props();

  type Mode = 'login' | 'signup' | 'forgot';
  let mode = $state<Mode>('login');

  const tabAnim = $derived(
    prefersReducedMotion.current ? { duration: 0 } : { y: 6, duration: 160, opacity: 0 }
  );

  function close() {
    mode = 'login';
    onclose();
  }
</script>

<Modal title="mimios@hub: ~/{mode}" {open} onclose={close}>
  <div class="p-6">
    <!-- Pestañas de navegación -->
    <div class="mb-5 flex gap-2 border-b border-line pb-4" role="group" aria-label="auth mode">
      <button
        type="button"
        class="term-tab {mode === 'login' ? 'active' : ''}"
        onclick={() => (mode = 'login')}
      >$ login</button>
      <button
        type="button"
        class="term-tab {mode === 'signup' ? 'active' : ''}"
        onclick={() => (mode = 'signup')}
      >$ sign up</button>
    </div>

    {#key mode}
      <div in:fly={{ ...tabAnim }}>
        {#if mode === 'forgot'}
          <ForgotPasswordForm onBack={() => (mode = 'login')} />
        {:else if mode === 'signup'}
          <RegisterForm onSuccess={close} />
        {:else}
          <LoginForm onSuccess={close} onForgot={() => (mode = 'forgot')} />
        {/if}
      </div>
    {/key}

    <div class="mt-4 flex justify-end">
      <button class="btn btn-ghost" type="button" onclick={close}>cancel</button>
    </div>
  </div>
</Modal>