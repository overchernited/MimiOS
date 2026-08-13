import type { WidgetInterface } from "@/components/widgetsRenderer/types";

interface StoredWidget extends WidgetInterface {
    id: string;
}

export class widgetStore {
    items = $state<StoredWidget[]>([]);

    load(widgets: WidgetInterface[]) {
        const existing = new Map(
            this.items.map((w) => [`${w.tagName}-${w.gridPosition.col}-${w.gridPosition.row}`, w.id])
        );
        this.items = widgets.map((widget) => ({
            ...widget,
            id: existing.get(`${widget.tagName}-${widget.gridPosition.col}-${widget.gridPosition.row}`) ?? crypto.randomUUID()
        }));
    }

    clear() {
        this.items = [];
    }
}
export const WidgetStore = new widgetStore();
