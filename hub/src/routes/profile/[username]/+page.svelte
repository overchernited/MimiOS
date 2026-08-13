<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { auth } from '$lib/auth.svelte';
  import { getProfileByUsername } from '$lib/profiles';
  import { marketplace, CATALOG_KINDS, type CatalogKind } from '$lib/marketplace';
  import { removeCatalogItem } from '$lib/uploads';
  import type { CatalogEntry } from '$lib/types';
  import TerminalWindow from '../../../components/terminal-window.svelte';
  import { formatBytes } from '$lib/marketplace';
  import { ArrowLeft } from '@lucide/svelte';

  const username = $derived(page.params.username ?? '');

  type Group = { kind: CatalogKind; items: CatalogEntry[] };
  let profileId: string | null = $state(null);
  let groups: Group[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let busy = $state(false);

  const isOwn = $derived(!!auth.user && auth.user.id === profileId);

  onMount(async () => {
    try {
      const profile = await getProfileByUsername(username);
      if (!profile) throw new Error(`profile not found: ${username}`);
      profileId = profile.id;
      const [cartridges, apps, widgets] = await Promise.all(
        CATALOG_KINDS.map((k) => marketplace.listByUser(k, profile.id))
      );
      groups = [
        { kind: 'cartridges', items: cartridges },
        { kind: 'apps', items: apps },
        { kind: 'widgets', items: widgets }
      ];
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  });

  async function handleDelete(kind: CatalogKind, item: CatalogEntry) {
    if (busy) return;
    busy = true;
    try {
      await removeCatalogItem(kind, item);
      const group = groups.find((g) => g.kind === kind);
      if (group) group.items = group.items.filter((i) => i.id !== item.id);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head>
  <title>{username} — MimiOS Hub</title>
</svelte:head>

{#if loading}
  <div class="container py-24">
    <p class="text-sm text-dim">> reading profile…</p>
  </div>
{:else if error}
  <div class="container flex flex-col items-start gap-6 py-24">
    <p class="m-0 text-sm text-red">> {error}</p>
    <a class="btn btn-ghost" href="/"><ArrowLeft size={16} /> back to hub</a>
  </div>
{:else}
  <section class="border-b border-line">
    <div class="container py-14 md:py-20">
      <a class="mb-8 inline-flex items-center gap-2 text-sm text-dim transition-colors hover:text-accent hover:no-underline" href="/">
        <ArrowLeft size={16} /> $ cd ..
      </a>

      <TerminalWindow title={`mimios@hub: ~/profiles/${username}`}>
        <div class="p-6">
          <p class="m-0 mb-2 text-xs uppercase tracking-[0.2em] text-accent">$ whoami</p>
          <h1 class="text-3xl md:text-4xl">~ {username}</h1>
          <p class="m-0 mt-3 text-sm text-dim">
            {isOwn ? '> your uploaded cartridges, apps and widgets' : `> ${username}'s published catalog`}
          </p>
        </div>
      </TerminalWindow>
    </div>
  </section>

  <section class="border-b border-line">
    <div class="container py-14 md:py-20">
      <h2 class="section-title">Uploads</h2>

      {#each groups as group (group.kind)}
        <div class="mb-8">
          <p class="m-0 mb-3 text-xs text-faint">$ ls {group.kind}/</p>
          {#if group.items.length === 0}
            <p class="m-0 text-sm text-dim">> no {group.kind} published</p>
          {:else}
            <ul class="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
              {#each group.items as item (item.id)}
                <li class="terminal-card blue p-4">
                  <a class="block hover:no-underline" href={`/item/${group.kind}/${item.id}`}>
                    <p class="m-0 truncate font-bold text-fg">{item.title} <span class="text-xs font-normal text-dim">v{item.version}</span></p>
                    <p class="m-0 mt-1 truncate text-sm text-dim">{item.description}</p>
                  </a>
                  <p class="m-0 mt-2 text-xs text-faint">
                    <span class="text-accent">✓</span> {item.chip ?? 'auto'}
                    {#if item.file_size}<span class="ml-2">· {formatBytes(item.file_size)}</span>{/if}
                    {#if item.downloads != null}<span class="ml-2">· {item.downloads} dl</span>{/if}
                  </p>
                  {#if isOwn}
                    <div class="mt-3 flex justify-end">
                      <button
                        class="rounded-md border border-red/40 px-3 py-1 text-xs text-red transition-colors hover:bg-red hover:text-black"
                        disabled={busy}
                        onclick={() => void handleDelete(group.kind, item)}
                      >rm {item.id}</button>
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </div>
  </section>
{/if}
