<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../app.css';
  import Navbar from '../components/navbar.svelte';
  import Footer from '../components/footer.svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="scanlines grid-bg min-h-screen">
  <Navbar />
  <main id="top">
    {@render children()}
  </main>
  <Footer />
</div>
