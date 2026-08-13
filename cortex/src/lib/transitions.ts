import type { TransitionConfig } from 'svelte/transition';
import { cubicInOut } from 'svelte/easing';

export const screen = (node: Element, params: { duration?: number } = {}): TransitionConfig => {
  const duration = params.duration ?? 400;
  return {
    duration,
    easing: cubicInOut,
    css: (t) => `opacity: ${t}; transform: scale(${0.95 + 0.05 * t});`,
  };
};
