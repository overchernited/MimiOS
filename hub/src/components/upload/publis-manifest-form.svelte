<script lang="ts">
  import { uploadApp, uploadWidget } from '$lib/uploads';
  import type { CatalogKind } from '$lib/marketplace';

  let { kind, onSuccess }: { kind: 'apps' | 'widgets'; onSuccess: () => void } = $props();

  let title = $state('');
  let description = $state('');
  let version = $state('1.0.0');
  let img = $state('');
  let manifestText = $state('');
  let busy = $state(false);
  let error = $state<string | null>(null);

  const imgUrl = $derived(img.trim() || null);
  const canSubmit = $derived(!busy && title.trim().length > 0);

  async function handleSubmit() {
    if (!canSubmit) return;
    busy = true;
    error = null;
    try {
      let manifest: Record<string, unknown> = {};
      if (manifestText.trim()) {
        const parsed = JSON.parse(manifestText);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error('manifest must be a JSON object');
        }
        manifest = parsed;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        version: version.trim(),
        author: '', 
        img: imgUrl ?? undefined,
        manifest
      };

      if (kind === 'apps') {
        await uploadApp(payload);
      } else {
        await uploadWidget(payload);
      }

      onSuccess();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
    }
  }
</script>

<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
  <label class="block">
    <span class="term-label">title</span>
    <input class="term-input" bind:value={title} placeholder="My {kind === 'apps' ? 'App' : 'Widget'}" required />
  </label>

  <label class="block">
    <span class="term-label">description</span>
    <textarea class="term-input min-h-20 resize-y" bind:value={description} placeholder="what does it do?"></textarea>
  </label>

  <label class="block">
    <span class="term-label">version</span>
    <input class="term-input" bind:value={version} placeholder="1.0.0" />
  </label>

  <label class="block">
    <span class="term-label">image url (optional)</span>
    <input class="term-input" bind:value={img} placeholder="https://example.com/{kind === 'apps' ? 'app' : 'widget'}.png" />
    {#if imgUrl}
      <img src={imgUrl} alt="preview" class="mt-2 h-24 w-24 rounded-md border border-line bg-soft object-cover" />
    {/if}
  </label>

  <label class="block">
    <span class="term-label">manifest (json)</span>
    <textarea
      class="term-input min-h-28 resize-y"
      bind:value={manifestText}
      placeholder={kind === 'widgets' ? '{ "tag_name": "my-widget", "col": 1, "row": 1 }' : '{ "entry": "/main.js" }'}
    ></textarea>
  </label>

  {#if error}
    <p class="m-0 text-xs text-red">> error — {error}</p>
  {/if}

  <div class="mt-6 flex items-center justify-end">
    <button class="btn" type="submit" disabled={!canSubmit}>
      {busy ? 'publishing…' : `publish ${kind}`}
    </button>
  </div>
</form>