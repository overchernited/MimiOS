import type { WidgetInterface as Widget } from "@/components/widgetsRenderer/types";
import type { AppDescriptor, PreferencesConfig } from "@/types/preferences.type";
import { send } from "@/services/ws.svelte";
import { WidgetStore } from "@/stores/widgets.svelte";

type PreferenceValue = string | number | boolean | Widget[] | AppDescriptor[] | Record<string, unknown>[];

class storageStore {
    widgets: Widget[] = $state<Widget[]>([]);
    apps: AppDescriptor[] = $state<AppDescriptor[]>([]);
    preferences: Record<string, string | number | boolean | Record<string, unknown>[]> = $state({});

    load(config: PreferencesConfig, cartridge = '', cartridgeVersion = '', model = '') {
        const { widgets, apps, ...rest } = config;
        this.widgets = widgets ?? [];
        this.apps = apps ?? [];
        const configCartridgeVersion = typeof rest.cartridge_version === 'string' ? rest.cartridge_version : '';
        this.preferences = {
            ...rest,
            cartridge,
            cartridge_version: cartridgeVersion || configCartridgeVersion,
            model,
        } as Record<string, string | number | boolean | Record<string, unknown>[]>;

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
