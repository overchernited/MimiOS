import { Info, Palette } from '@lucide/svelte';
import type { Component } from 'svelte';
import WallpaperView from './wallpaper.svelte';
import SystemView from './system.svelte';

export interface ConfigView {
  label: string;
  icon?: Component;
  component: Component<Record<string, unknown>, any, any>;
}

export const configViews: Record<string, ConfigView> = {
  wallpaper: { label: 'Wallpaper', icon: Palette, component: WallpaperView },
  system: { label: 'System', icon: Info, component: SystemView },
};