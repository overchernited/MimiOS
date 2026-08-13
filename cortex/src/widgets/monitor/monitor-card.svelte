<script lang="ts">
  import type { Component } from 'svelte';


  interface Props {
    icon: Component,
    label: string,
    value: number | string
    unit?: string
  }

  let { icon: Icon, label = "SRAM", value = 0, unit = "" } : Props = $props();



</script>

<section
class="text-xl lg:text-2xl 2xl:text-3xl text-(--m-text-color) relative flex items-center montserrat gap-2 tracking-wider" >
    <div>
        <Icon class="w-[1em] h-[1em] stroke-[1.5]"/>
        <h2 class="absolute text-xs lg:text-sm 2xl:text-base font-semibold">{label}</h2>
    </div>
        <p class="text-lg lg:text-xl 2xl:text-2xl font-bold">{value}{unit}</p>
</section>