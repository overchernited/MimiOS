<script lang="ts">
  import type { WidgetInterface } from "@/components/widgetsRenderer/types";
  import { OS } from "@/lib/services";

  let { data }: { data: WidgetInterface } = $props();
  
  function init(node: HTMLElement) {
    (node as any).services = OS;
  }
</script>

<div class="widget-wrapper" style="grid-column: {data.gridPosition.col} / span {data.gridPosition.spanCol}; grid-row: {data.gridPosition.row} / span {data.gridPosition.spanRow};">
  <svelte:element 
    this={data.tagName} 
    use:init
  />
</div>

<style>
  .widget-wrapper { width: 100%; height: 100%; overflow: hidden; }
</style>
