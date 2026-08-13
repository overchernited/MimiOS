<script lang="ts">
  import { marketplace } from '@/lib/marketplace/marketplace';
  import { supabase } from '@/lib/marketplace/supabase';

  type LogLine = { time: string; kind: 'ok' | 'err'; text: string };

  let logs: LogLine[] = $state([]);
  let busy = $state(false);

  function push(kind: LogLine['kind'], text: string) {
    logs.push({ time: new Date().toLocaleTimeString(), kind, text });
    if (logs.length > 50) logs.shift();
    if (kind === 'err') console.error(text);
    else console.log(text);
  }

  async function run(label: string, fn: () => Promise<string>) {
    if (busy) return;
    busy = true;
    const t0 = performance.now();
    try {
      const msg = await fn();
      push('ok', `${label}: ${msg} (${(performance.now() - t0).toFixed(1)}ms)`);
    } catch (e) {
      push('err', `${label}: ${(e as Error).message}`);
    }
    busy = false;
  }

  const checkKind = (kind: string) =>
    run(kind, async () => {
      const rows = await marketplace.list(kind);
      return `${rows.length} filas -> ${rows.slice(0, 4).map((r: { id: string }) => r.id).join(', ')}`;
    });

  const checkStorage = () =>
    run('storage', async () => {
      const url = supabase.storage.from('cartridges').getPublicUrl('test.bin').data.publicUrl;
      const res = await fetch(url);
      return `GET public/test.bin -> HTTP ${res.status}${res.ok ? '' : ' (API responde, falta el objeto)'}`;
    });
</script>

<div class="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-white/10 bg-black/70 p-3 font-mono text-xs text-white shadow-2xl backdrop-blur">
  <div class="mb-2 flex items-center justify-between">
    <span class="uppercase tracking-wider text-white/50">API Marketplace</span>
    <button class="rounded bg-white/10 px-2 py-0.5 hover:bg-white/20" onclick={() => (logs = [])}>
      limpiar
    </button>
  </div>
  <div class="mb-2 flex flex-wrap gap-1.5">
    <button class="rounded bg-white/10 px-2 py-1 hover:bg-white/20" onclick={() => checkKind('apps')} disabled={busy}>Apps</button>
    <button class="rounded bg-white/10 px-2 py-1 hover:bg-white/20" onclick={() => checkKind('widgets')} disabled={busy}>Widgets</button>
    <button class="rounded bg-white/10 px-2 py-1 hover:bg-white/20" onclick={() => checkKind('cartridges')} disabled={busy}>Cartridges</button>
    <button class="rounded bg-white/10 px-2 py-1 hover:bg-white/20" onclick={checkStorage} disabled={busy}>Storage .bin</button>
  </div>
  <div class="max-h-48 overflow-y-auto rounded bg-black/50 p-2">
    {#each logs as log (log.time + log.text)}
      <div class="break-words leading-snug {log.kind === 'err' ? 'text-red-400' : 'text-emerald-400'}">
        <span class="text-white/40">[{log.time}]</span> {log.text}
      </div>
    {/each}
  </div>
</div>
