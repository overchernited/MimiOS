<svelte:options customElement={{tag: "monitor-widget", shadow: 'none'}} />

<script  lang="ts">
  import MonitorCard from "@/widgets/monitor/monitor-card.svelte";
  import { MemoryStick, CpuIcon, HardDrive, Thermometer } from "@lucide/svelte";

  import type { OSContext } from 'mimicortex';
  let { services }: { services: OSContext } = $props();

  // Access the sensor data from the services
  let data = $derived(services.sensor.data);

</script>

<section
 class="m-panel m-primary-background w-full h-full flex justify-center items-center gap-10 px-10 pb-5"
 >
<MonitorCard 
label="BOARD"
value={services.sensor.device_name || data?.device_id || "---"}
icon={CpuIcon}/>

<MonitorCard 
label="TEMP"
value={data?.temperature?.toFixed(1) ?? "---"}
unit="°"
icon={Thermometer}/>

 <MonitorCard 
 label="SRAM"
 value={data?.free_sram ? (data.free_sram / 1024).toFixed(0) : "---"}
 unit="KB"
 icon={MemoryStick}/>
 
<MonitorCard 
  label="FLASH"
  value={data?.free_flash ? (data.free_flash / 1024).toFixed(0) : "---"}
  unit="KB"
  icon={HardDrive}/>

</section>
