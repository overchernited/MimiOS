<script lang="ts">
  import Terminal from '../components/terminal.svelte';
  
  const props: {
      widgets: number;
      apps: number;
      cartridges: number;
      ready: boolean;
    } = $props();

</script>



<section class="relative border-b border-line">
  <div class="container grid items-center gap-12 py-24 md:grid-cols-2 md:py-32">
    <div>
      <h1 class="text-3xl leading-snug md:text-[2.6rem] md:leading-[1.15]">
        <span class="text-accent">$</span> firmware &amp; marketplace
        <span class="text-dim">for your</span> esp32<span class="text-accent">.</span>
      </h1>
      <p class="m-0 mt-6 max-w-md text-sm leading-relaxed text-dim">
        Download the base OS, then install widgets, apps and cartridges over the air — no cables, no compiling. Browse
        the community catalog, flash your board, and make it yours.
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a class="btn" href="#firmware">↓ download .bin</a>
        <a class="btn btn-ghost" href="#catalog">browse catalog</a>
      </div>
    </div>

    <Terminal widgets={props.widgets} apps={props.apps} cartridges={props.cartridges} ready={props.ready} />
  </div>
</section>