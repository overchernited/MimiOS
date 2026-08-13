<script lang="ts">
  import { TopFadeIn } from "mimicortex";

  let { title, color} = $props();
</script>

<span in:TopFadeIn class="font-bold text-base lg:text-xl 2xl:text-2xl block rounded-full h-8 w-8  bg-(--m-foreground-color) shrink-0 " style="color: {color}">{title[0]}</span>