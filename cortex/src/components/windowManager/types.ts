import type { Component } from "svelte"

export interface Application {
    id: string
    title: string
    image?: string
    icon?: Component
    applicationTag: string
    sourceUrl: string
    isMaximized: boolean
    isMinimized: boolean
    focused: boolean
    position: {x:number, y: number}
    size: { width: number; height: number };
    prevPosition?: {x:number, y: number};
    zIndex: number;
}

export interface NewApplication {
    id?: string
    title: string
    image?: string
    icon?: Component
    applicationTag: string
    sourceUrl: string
    size?: { width: number; height: number }
}
