<script lang="ts">
  import { fly } from 'svelte/transition';
  import { prefersReducedMotion } from 'svelte/motion';
  import Modal from '../modal/modal.svelte';
  import { auth } from '$lib/auth.svelte';
  import PublishCartridgeForm from './publish-cartridge-form.svelte';
  import PublishManifestForm from './publis-manifest-form.svelte';

  let { open, onclose }: { open: boolean; onclose: () => void } = $props();

  type PublishKind = 'cartridges' | 'apps' | 'widgets';
  let activeTab = $state<PublishKind>('cartridges');

  const publishForms: Record<PublishKind, any> = {
    cartridges: PublishCartridgeForm,
    apps: PublishManifestForm,
    widgets: PublishManifestForm,
  };

  const tabAnim = $derived(
    prefersReducedMotion.current ? { duration: 0 } : { y: 6, duration: 160, opacity: 0 }
  );

  let ActiveComponent = $derived(publishForms[activeTab]);

  function close() {
    activeTab = 'cartridges';
    onclose();
  }
</script>

<Modal title="mimios@hub: publish ~/{activeTab}" {open} onclose={close} width="max-w-xl">
  <div class="p-6">
    {#if !auth.user}
      <p class="m-0 text-sm text-red">> sign in to publish content</p>
    {:else}
      <div class="mb-5 flex gap-2 border-b border-line pb-4" role="group" aria-label="publish kind">
        {#each ['cartridges', 'apps', 'widgets'] as kind (kind)}
          <button
            type="button"
            class="term-tab {activeTab === kind ? 'active' : ''}"
            onclick={() => (activeTab = kind as PublishKind)}
          >$ {kind}</button>
        {/each}
      </div>

      {#key activeTab}
        <div in:fly={{ ...tabAnim }}>
          {#if activeTab === 'cartridges'}
            <ActiveComponent onSuccess={close} />
          {:else}
            <ActiveComponent kind={activeTab} onSuccess={close} />
          {/if}
        </div>
      {/key}

      <div class="mt-4 flex justify-between items-center border-t border-line pt-4">
        <span class="text-xs text-faint">> target: public schema / {activeTab}</span>
        <button class="btn btn-ghost" type="button" onclick={close}>cancel</button>
      </div>
    {/if}
  </div>
</Modal>