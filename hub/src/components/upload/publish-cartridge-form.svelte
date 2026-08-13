<script lang="ts">
  import { uploadCartridge, UPLOAD_CHIPS } from '$lib/uploads';
  import { formatBytes } from '$lib/marketplace';

  let { onSuccess }: { onSuccess: () => void } = $props();

  let title = $state('');
  let description = $state('');
  let version = $state('1.0.0');
  let chip = $state<string>(UPLOAD_CHIPS[0]);
  let img = $state('');
  let manifestText = $state('');
  let file = $state<File | null>(null);
  let busy = $state(false);
  let status = $state<string | null>(null);
  let error = $state<string | null>(null);

  const fileSize = $derived(file ? formatBytes(file.size) : null);
  const imgUrl = $derived(img.trim() || null);
  const canSubmit = $derived(
    !busy && title.trim().length > 0 && !!file && file.name.toLowerCase().endsWith('.bin')
  );

  function pickFile(target: EventTarget & HTMLInputElement) {
    file = target.files?.[0] ?? null;
    error = null;
  }

  async function handleSubmit() {
    if (!canSubmit || !file) return;
    busy = true;
    status = '> parsing manifest & uploading…';
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
      
      await uploadCartridge({
        title: title.trim(),
        description: description.trim(),
        version: version.trim(),
        chip,
        img: imgUrl ?? undefined,
        file,
        manifest
      });
      onSuccess();
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      busy = false;
      status = null;
    }
  }
</script>

<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
  <label class="block">
    <span class="term-label">title</span>
    <input class="term-input" bind:value={title} placeholder="my cartridge" required />
  </label>

  <label class="block">
    <span class="term-label">description</span>
    <textarea class="term-input min-h-20 resize-y" bind:value={description} placeholder="what does it do?"></textarea>
  </label>

  <div class="grid grid-cols-2 gap-2">
    <label class="block">
      <span class="term-label">chip</span>
      <select class="term-input" bind:value={chip}>
        {#each UPLOAD_CHIPS as c}
          <option value={c}>{c}</option>
        {/each}
      </select>
    </label>

    <label class="block">
      <span class="term-label">version</span>
      <input class="term-input" bind:value={version} placeholder="1.0.0" />
    </label>
  </div>

  <label class="block">
    <span class="term-label">image url (optional)</span>
    <input class="term-input" bind:value={img} placeholder="https://example.com/cartridge.png" />
    {#if imgUrl}
      <img src={imgUrl} alt="cartridge preview" class="mt-2 h-24 w-24 rounded-md border border-line bg-soft object-cover" />
    {/if}
  </label>

  <label class="block">
    <span class="term-label">binary file (.bin) {fileSize ? `(${fileSize})` : ''}</span>
    <input class="term-input cursor-pointer file:text-faint" type="file" accept=".bin" onchange={(e) => pickFile(e.currentTarget)} required />
  </label>

  <label class="block">
    <span class="term-label">manifest (json)</span>
    <textarea
      class="term-input min-h-24 resize-y"
      bind:value={manifestText}
      placeholder={'{ "tag_name": "my-cartridge" }'}
    ></textarea>
  </label>

  {#if status}
    <p class="m-0 text-xs text-accent">{status}</p>
  {/if}

  {#if error}
    <p class="m-0 text-xs text-red">> error — {error}</p>
  {/if}

  <div class="mt-6 flex items-center justify-end">
    <button class="btn" type="submit" disabled={!canSubmit}>
      {busy ? 'publishing…' : 'publish cartridge'}
    </button>
  </div>
</form>