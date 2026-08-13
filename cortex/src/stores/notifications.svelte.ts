import type { Notification } from "@/types/notification-types"


class notificationStore {
    items = $state<Notification[]>([])

    add(notification: Notification) {
        this.items.push(notification)
    }


    remove(id: string) {
        this.items = this.items.filter(n => n.id !== id);
    }

    clear() {
        this.items = []
    }
}

export const NotificationStore = new notificationStore()