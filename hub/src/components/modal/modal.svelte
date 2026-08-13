<script lang="ts">
  import type { Snippet } from 'svelte';
  import { gsap } from 'gsap';
  import TerminalWindow from '../terminal-window.svelte';

  let {
    title,
    open,
    onclose,
    children,
    width = 'max-w-md'
  }: { title: string; open: boolean; onclose: () => void; children: Snippet; width?: string } = $props();

  let rendered = $state(false);
  let closing = $state(false);
  let backdropEl = $state<HTMLButtonElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  const reduced = $derived(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  function finishClose() {
    closing = false;
    rendered = false;
    onclose();
  }

  function requestClose() {
    if (closing) return;
    if (!reduced && panelEl && backdropEl) {
      closing = true;
      const tl = gsap.timeline({ onComplete: finishClose });
      tl.to(panelEl, { opacity: 0, y: -14, scale: 0.98, duration: 0.18, ease: 'power2.in' });
      tl.to(backdropEl, { opacity: 0, duration: 0.16, ease: 'power1.out' }, '<');
    } else {
      finishClose();
    }
  }

  $effect(() => {
    if (open) {
      closing = false;
      rendered = true;
    } else if (!closing) {
      rendered = false;
    }
  });

  $effect(() => {
    if (!open || !rendered || !backdropEl || !panelEl) return;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([backdropEl, panelEl], { opacity: 1, y: 0, scale: 1 });
        return;
      }
      gsap.fromTo(backdropEl, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' });
      gsap.fromTo(
        panelEl,
        { opacity: 0, y: 26, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: 'power2.out', clearProps: 'y,scale' }
      );
    });
    return () => ctx.revert();
  });

  $effect(() => {
    if (!rendered) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  });

  $effect(() => {
    if (!rendered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

{#if rendered}
  <button
    type="button"
    aria-label="Close dialog"
    class="fixed inset-0 z-50 w-full cursor-default bg-pitch/70 backdrop-blur-sm"
    bind:this={backdropEl}
    onclick={requestClose}
  ></button>
  <div class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
    <div class="pointer-events-auto w-full {width}" bind:this={panelEl}>
      <TerminalWindow {title} onclose={requestClose}>
        {@render children()}
      </TerminalWindow>
    </div>
  </div>
{/if}
