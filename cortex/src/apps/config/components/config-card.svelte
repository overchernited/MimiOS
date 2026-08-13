<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    children?: Snippet;
  }

  let { label, children }: Props = $props();
</script>

<div class="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
  <span class="text-sm opacity-70">{label}</span>
  <div class="font-bold">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>