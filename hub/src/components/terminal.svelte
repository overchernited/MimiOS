<script lang="ts">
  import TerminalWindow from './terminal-window.svelte';

  let { widgets, apps, cartridges, ready }: { widgets: number; apps: number; cartridges: number; ready: boolean } =
    $props();

  const lines = $derived([
    { cmd: './mimios --connect esp32' },
    { out: '> device online', tag: 'ok' },
    { cmd: 'ls /hub' },
    { out: 'apps/  widgets/  cartridges/  base_firmware.bin' },
    { cmd: 'fetch firmware --chip <model>' },
    { out: '> base_firmware.bin ready', tag: 'ok' },
    { cmd: 'open hub/widgets' },
    { out: `> ${widgets} widgets · ${apps} apps · ${cartridges} cartridges`, tag: 'ok' }
  ]);

  let step = $state(0);
  let char = $state(0);
  let done = $state(false);

  $effect(() => {
    if (!ready) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (cancelled) return;
      const line = lines[step];
      if (!line) {
        done = true;
        return;
      }
      if (line.cmd !== undefined && char < line.cmd.length) {
        char += 1;
        timer = setTimeout(tick, 42);
      } else {
        timer = setTimeout(
          () => {
            step += 1;
            char = 0;
            tick();
          },
          line.cmd !== undefined ? 380 : 460
        );
      }
    };

    timer = setTimeout(tick, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  });
</script>

<TerminalWindow title="mimios@hub: ~/hub — zsh" className="min-h-[330px]">
  <div class="flex-1 p-5 text-sm">
    {#if !ready}
      <p class="mb-1.5 text-dim">> waiting for catalog…</p>
      <p class="mt-2">
        <span class="font-bold text-accent">mimios</span><span class="text-dim">@hub</span>:<span class="text-blue">~/hub</span>
        <span class="font-bold text-accent">$</span> <span class="cursor text-accent">█</span>
      </p>
    {:else}
      {#each lines as line, i (i)}
        {#if line.cmd !== undefined}
          {@const cmdText = line.cmd}
          <p class="mb-1.5 flex items-baseline gap-2 whitespace-nowrap text-fg max-md:whitespace-normal">
            <span><span class="font-bold text-accent">mimios</span><span class="text-dim">@hub</span>:<span class="text-blue">~/hub</span></span>
            <span class="font-bold text-accent">$</span>
            <span>{cmdText.slice(0, i < step ? cmdText.length : char)}</span>
          </p>
        {:else}
          <p class="mb-1.5 flex items-center gap-2 text-dim">
            <span>{line.out}</span>
            <span class="rounded bg-accent/15 px-1.5 py-px text-xs font-bold text-accent">[OK]</span>
          </p>
        {/if}
      {/each}

      {#if step < lines.length}
        <p class="mt-2 text-accent"><span class="cursor">█</span></p>
      {:else}
        <p class="mt-2">
          <span class="font-bold text-accent">mimios</span><span class="text-dim">@hub</span>:<span class="text-blue">~/hub</span>
          <span class="font-bold text-accent">$</span> <span class="cursor text-accent">█</span>
        </p>
      {/if}
    {/if}
  </div>
</TerminalWindow>
