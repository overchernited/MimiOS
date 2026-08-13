<script lang="ts">
  import type { Application } from "@/components/windowManager/types";
  import { WindowStore } from "@/stores/windows.svelte";
  import { OS } from "@/lib/services";
  import { twMerge } from "tailwind-merge";
  import { Minimize2, Scaling, X } from "@lucide/svelte";
  import { PopIn, PopOut } from "mimicortex";
  import gsap from "gsap";

  let windowEl: HTMLElement | undefined = $state();
  let wasMinimized = false;
  let dragging = $state(false);
  let dragOffset = { x: 0, y: 0 };

  let { data }: { data: Application } = $props();

  function init(node: HTMLElement) {
    (node as any).services = OS;
  }

  function handlePointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    WindowStore.focus(data.id);

    if (data.isMaximized) {
      WindowStore.maximize(data.id);
      WindowStore.move(data.id, e.clientX - data.size.width / 2, 0);
    }
    dragOffset = {
      x: e.clientX - data.position.x,
      y: e.clientY - data.position.y,
    };
    dragging = true;
  }

  function handlePointerMove(e: PointerEvent) {
    if (!dragging) return;
    WindowStore.move(
      data.id,
      e.clientX - dragOffset.x,
      e.clientY - dragOffset.y,
    );
  }

  function handlePointerUp(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
  }

  const maximize = () => {
    WindowStore.maximize(data.id);
  };

  const close = () => {
    WindowStore.close(data.id);
  };

  const minimize = () => {
    WindowStore.minimize(data.id);
  };

  $effect(() => {
    const minimized = data.isMinimized;
    if (!windowEl) {
      wasMinimized = minimized;
      return;
    }

    const rect = windowEl.getBoundingClientRect();
    if (!wasMinimized && minimized) {
      gsap.to(windowEl, {
        scaleY: 0.05,
        scaleX: 0.6,
        y: window.innerHeight - rect.top,
        transformOrigin: "bottom center",
        duration: 0.5,
        ease: "power2.inOut",
      });
    } else if (wasMinimized && !minimized) {
      gsap.fromTo(
        windowEl,
        {
          scaleY: 0.05,
          scaleX: 0.6,
          opacity: 0,
          y: window.innerHeight - rect.top,
        },
        {
          scaleY: 1,
          scaleX: 1,
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
      );
    }

    wasMinimized = minimized;
  });
</script>

<div
  in:PopIn
  out:PopOut
  bind:this={windowEl}

  role="none"
  class={twMerge("app-wrapper", data.focused ? "" : "grayscale-100")}
  onclick={() => WindowStore.focus(data.id)}
  onkeydown={(e) => e.key === "Enter" && WindowStore.focus(data.id)}
  style="
   z-index: {data.zIndex}; 
   {data.isMaximized
    ? `inset: 0; width:100vw; height:100vh;`
    : `top: ${data.position.y}px; left: ${data.position.x}px; height: ${data.size.height}px; width: ${data.size.width}px;`}"
>

  <div
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={() => (dragging = false)}
    ondblclick={(e) => {
      if (!(e.target as HTMLElement).closest("button"))
        WindowStore.maximize(data.id);
    }}
    role="none"
    style="cursor: {dragging ? 'grabbing' : 'default'}"
    class="title-bar m-primary-background p-4 font-bold text-white flex items-center justify-between overflow-auto"
  >
    <div>
      <h2>{data.title}</h2>
      {#if data.icon}
        {@const Icon = data.icon}
        <Icon />
      {/if}
    </div>
    <div class="window-controls">
      <button onclick={minimize} class="minimize"
        ><Minimize2 strokeWidth={2} /></button
      >
      <button onclick={maximize} class="resize"
        ><Scaling strokeWidth={2} /></button
      >
      <button onclick={close} class="close"><X strokeWidth={2} /></button>
    </div>
  </div>
  <svelte:element this={data.applicationTag} use:init />
</div>

<style>
  .app-wrapper {
    overflow: hidden;
    position: absolute;
    display: flex;
    flex-direction: column;
    border-radius: 30px;
    border: none;
    padding: 0;
    margin: 0;
    background: none;
    text-align: unset;
    font: inherit;
    color: inherit;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    transition:
      height 0.3s ease,
      width 0.3s ease,
      opacity 0.3s ease;
  }

  .app-wrapper > :last-child {
    flex: 1;
    min-height: 0;
  }

  .window-controls > button {
    width: 2rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    border-radius: 9999px;
    color: var(--m-foreground-color);
  }

  .close {
    background-color: var(--m-red-color);
  }

  .resize {
    background-color: var(--m-yellow-color);
  }

  .minimize {
    background-color: var(--m-blue-color);
  }
</style>
