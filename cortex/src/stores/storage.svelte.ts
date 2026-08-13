import type { WidgetInterface as Widget } from "@/components/widgetsRenderer/types";
import type { AppDescriptor } from "@/types/preferences.type";
import { send } from "@/services/ws.svelte";
import { WidgetStore } from "@/stores/widgets.svelte";

type PreferenceValue = string | number | boolean | Widget[] | AppDescriptor[] | Record<string, unknown>[];

class storageStore {
    widgets: Widget[] = $state<Widget[]>([]);
    apps: AppDescriptor[] = $state<AppDescriptor[]>([]);
    preferences: Record<string, any> = $state({});

    load(data: any) {
        const config = data.config ?? data;
        const { widgets, apps, ...rest } = config;

        this.widgets = widgets ?? [];
        this.apps = apps ?? [];
       
        this.preferences = {
            ...rest,
            os: data.os ?? rest.os,
            cartridge: data.cartridge ?? rest.cartridge,
            cartridge_version: data.cartridge_version ?? rest.cartridge_version,
            model: data.model ?? rest.model,
            cores: data.cores ?? rest.cores,
            cpu_freq: data.cpu_freq ?? rest.cpu_freq,
            revision: data.revision ?? rest.revision,
            flash_size: data.flash_size ?? rest.flash_size,
            flash_speed: data.flash_speed ?? rest.flash_speed,
            heap: data.heap ?? rest.heap,
            mac: data.mac ?? rest.mac,
        };

        WidgetStore.load(this.widgets);
    }

    set(key: string, value: PreferenceValue) {
        send({ cmd: "set_preference", key, value });
    }

    get(key: string) {
        return this.preferences[key];
    }

    clear() {
        this.widgets = [];
        this.apps = [];
        this.preferences = {};
    }
}

export const StorageStore = new storageStore();