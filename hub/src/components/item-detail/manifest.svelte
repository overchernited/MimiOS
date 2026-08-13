<script lang="ts">
  import type { CatalogItem } from '$lib/types';
  import type { CatalogKind } from '$lib/marketplace';
  import TerminalWindow from '../terminal-window.svelte';

  let { kind, item }: { kind: CatalogKind; item: CatalogItem } = $props();

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const highlighted = $derived.by(() => {
    const json = JSON.stringify(item.manifest ?? {}, null, 2);
    return esc(json).replace(
      /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g,
      (m, str, colon, kw, num) => {
        if (str !== undefined)
          return colon !== undefined
            ? `<span class="text-accent">${str}</span>${colon}`
            : `<span class="text-blue">${str}</span>`;
        if (kw !== undefined) return `<span class="text-yellow">${kw}</span>`;
        if (num !== undefined) return `<span class="text-yellow">${num}</span>`;
        return m;
      }
    );
  });
</script>

<TerminalWindow title={`~/hub/${kind}/${item.id} — manifest.json`}>
  <pre class="m-0 max-h-[70vh] overflow-auto whitespace-pre-wrap break-words p-5 text-xl leading-relaxed text-fg">{@html highlighted}</pre>
</TerminalWindow>
