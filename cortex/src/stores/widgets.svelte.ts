import type { WidgetInterface } from "@/components/widgetsRenderer/types";

interface StoredWidget extends WidgetInterface {
    id: string;
    sourceUrl?: string;
}

const widgetModules = import.meta.glob('/src/apps/**/*.svelte'); 

export class widgetStore {
    items = $state<StoredWidget[]>([]);

    async load(widgets: WidgetInterface[]) {
        const existing = new Map(
            this.items.map((w) => [`${w.tagName}-${w.gridPosition.col}-${w.gridPosition.row}`, w.id])
        );

        for (const widget of widgets) {
            const storedWidget = this.items.find(
                (w) => w.tagName === widget.tagName && w.gridPosition.col === widget.gridPosition.col && w.gridPosition.row === widget.gridPosition.row
            );
            
            const sourceUrl = (widget as any).sourceUrl || (storedWidget as any)?.sourceUrl;

            if (widget.tagName && !customElements.get(widget.tagName) && sourceUrl) {
                try {
                    if (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
                        await import(/* @vite-ignore */ sourceUrl);
                    } else {
                        const loadWidget = widgetModules[sourceUrl];
                        if (!loadWidget) {
                            throw new Error(`La ruta "${sourceUrl}" no coincide con ningún archivo .svelte`);
                        }
                        await loadWidget();
                    }
                } catch (error) {
                    console.error(`Could not runtime-load widget [${widget.tagName}]:`, error);
                }
            }
        }

        this.items = widgets.map((widget) => {
            const storedWidget = this.items.find(
                (w) => w.tagName === widget.tagName && w.gridPosition.col === widget.gridPosition.col && w.gridPosition.row === widget.gridPosition.row
            );
            return {
                ...widget,
                id: existing.get(`${widget.tagName}-${widget.gridPosition.col}-${widget.gridPosition.row}`) ?? crypto.randomUUID(),
                sourceUrl: (widget as any).sourceUrl || (storedWidget as any)?.sourceUrl
            };
        });
    }

    clear() {
        this.items = [];
    }
}

export const WidgetStore = new widgetStore();
