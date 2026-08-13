<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    children,
    className = '',
    onclose
  }: { title: string; children: Snippet; className?: string; onclose?: () => void } = $props();
</script>

<div class="terminal-card flex flex-col overflow-hidden {className}">
  <div class="flex items-center gap-3 border-b border-line bg-soft px-4 py-2.5">
    <span class="flex gap-1.5" aria-hidden="true">
      <i class="h-2.5 w-2.5 rounded-full bg-red"></i>
      <i class="h-2.5 w-2.5 rounded-full bg-yellow"></i>
      <i class="h-2.5 w-2.5 rounded-full bg-accent"></i>
    </span>
    <span class="truncate text-xs text-dim">{title}</span>
    {#if onclose}
      <button
        class="ml-auto grid h-6 w-6 cursor-pointer place-items-center rounded border border-line text-xs text-faint transition-colors hover:border-accent/50 hover:text-accent"
        onclick={onclose}
        aria-label="Close"
      >
        ×
      </button>
    {/if}
  </div>
  {@render children()}
</div>
