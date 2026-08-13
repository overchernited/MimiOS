<script lang="ts">
  import { PopIn, BottomFadeOut, TopFadeIn, SlideUpIn, SlideUpOut } from "mimicortex";
  import type { Notification } from "@/types/notification-types";
  import { twMerge } from "tailwind-merge";

  let { process, title, message, color, useclass }: Notification = $props();
</script>


<div 
in:SlideUpIn
out:SlideUpOut
style="border-color: {color};"
class={twMerge(`flex flex-col inter border-b-3 text-(--m-text-color) m-5 p-2`, useclass)}>
<p class="text-base lg:text-lg 2xl:text-xl font-semibold">{process}</p>
<h1 style="color: {color}" class="montserrat text-xl md:text-2xl 2xl:text-3xl font-bold">{title.toUpperCase()}</h1>
<p>{message}</p>
</div>