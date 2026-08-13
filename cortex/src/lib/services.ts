import { NotificationStore } from "@/stores/notifications.svelte";
import { LogStore } from "@/stores/logs.svelte";
import { WindowStore } from "@/stores/windows.svelte";
import { SensorStore } from "@/stores/sensor.svelte";
import { StorageStore } from "@/stores/storage.svelte";
import { formatBytes } from "@/lib/format";

export const OS = {
    notifications: NotificationStore,
    logs: LogStore,
    windows: WindowStore,
    sensor: SensorStore,
    storage: StorageStore,
    formatBytes
};
