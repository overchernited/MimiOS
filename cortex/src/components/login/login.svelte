<script lang="ts">
  import { AuthStore } from "@/stores/auth.svelte";
  import { SensorStore } from "@/stores/sensor.svelte";
  import { StorageStore } from "@/stores/storage.svelte";
  import { User, Key, Cpu } from "@lucide/svelte";
  import { screen } from "@/lib/transitions";
  import { SlideUpIn } from "mimicortex";

  let username = $state("");
  let password = $state("");
  let error = $state("");

  const deviceName = $derived(SensorStore.device_name);
  const wallpaper = $derived(String(StorageStore.get('loginWallpaper') ?? ''));
  const isVideo = $derived(/\.mp4$/i.test(wallpaper));

  const submit = async () => {
    error = "";
    const valid = await AuthStore.login(username, password);
    if (!valid) error = "Invalid credentials";
  };
</script>

<div
  style={!isVideo ? `background-image: url(${wallpaper}); background-size: cover; background-position: center;` : ''}
  class="fixed inset-0 flex items-center justify-center"
  transition:screen
>
  {#if isVideo}
    <video
      class="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
      src={wallpaper}
      autoplay
      muted
      loop
      playsinline
      preload="auto"
    ></video>
  {/if}
  <form
    onsubmit={(e) => {
      e.preventDefault();
      submit();
    }}
    class=" flex w-[90vh] h-[50vh] flex-row items-center justify-between p-8 text-(--m-text-color)"
  >

    <div class="w-full h-full rounded-l-2xl m-foreground text-(--m-text-color) flex flex-col items-center justify-center text-center">
      <h2 class="text-3xl md:text-4xl 2xl:text-5xl font-bold ">Mimi OS</h2>
      <p class="text-sm md:text-base 2xl:text-lg"> Welcome back! Please use your credentials please.</p>
      <p class="mt-3 flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold">
        <Cpu class="h-4 w-4 text-(--m-accent-color)" strokeWidth={2} />
        {deviceName}
      </p>
    </div>

    {#if error}
    <p in:SlideUpIn class="absolute m-10 top-0 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-center text-sm md:text-base font-semibold text-(--m-text-color) bg-(--m-red-color) shadow-lg">{error}</p>
    {/if}

  <div class="rounded-r-2xl m-primary-background relative w-full h-full gap-2 p-5 flex flex-col justify-center items-center">
    <div
      class=" flex h-28 w-28 items-center justify-center rounded-full border border-(--m-accent-color)/40 bg-(--m-accent-color)/10"
    >
      <User class="w-16 h-16 text-(--m-text-color)" strokeWidth={1.5} />
    </div>
    
    <h1 class="montserrat text-4xl md:text-5xl 2xl:text-6xl font-bold tracking-wide">Mimi OS</h1>


    <label class="flex flex-col gap-1 text-sm font-semibold">
      Username
      <input
        bind:value={username}
        autocomplete="username"
        placeholder="admin"
        class="m-input w-80"
      />

    </label>
    
    <label class="flex flex-col gap-1 text-sm font-semibold">
      Password
      <input
        bind:value={password}
        type="password"
        autocomplete="current-password"
        placeholder="••••••••"
        class="m-input w-80"
      />

    </label>
    
    <button
      type="submit"
      disabled={AuthStore.pending}
      class="m-button background mt-2 px-8 disabled:opacity-50 w-full"
    >
      {AuthStore.pending ? "Verifying..." : "Login"}
    </button>
  </div>
  </form>
</div>
