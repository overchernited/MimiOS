import type { Application, NewApplication } from "@/components/windowManager/types"

const appModules = import.meta.glob('/src/apps/**/*.svelte');

export class windowStore {
    items = $state<Application[]>([])

    async openApp(app: NewApplication) {
        
        if (!customElements.get(app.applicationTag)) {
            try {
                if (app.sourceUrl.startsWith('http://') || app.sourceUrl.startsWith('https://')) {
                    await import(/* @vite-ignore */ app.sourceUrl);
                } else {
                    const loadApp = appModules[app.sourceUrl];
                    
                    if (!loadApp) {
                        throw new Error(
                            `La ruta "${app.sourceUrl}" no coincide con ningún archivo .svelte en /src/apps/. ` +
                            `Asegúrate de que empiece con "/src/apps/" y termine en ".svelte"`
                        );
                    }

                    await loadApp(); 
                }
            } catch (error) {
                console.error(`Could not load application from: ${app.sourceUrl}`, error);
                return;
            }
        }

        const maxZ = this.items.length > 0 ? Math.max(...this.items.map(w => w.zIndex || 0)) : 0;

        const newApplication: Application = {
            id: app.id ?? crypto.randomUUID(),
            title: app.title,
            image: app.image,
            icon: app.icon,
            applicationTag: app.applicationTag,
            sourceUrl: app.sourceUrl,
            isMaximized: false,
            isMinimized: false,
            focused: true,
            position: { x: 100 + (this.items.length * 20), y: 100 + (this.items.length * 20) },
            size: app.size ?? { width: 600, height: 600 },
            zIndex: maxZ + 1
        }

        this.items.forEach(w => w.focused = false);        
        this.items.push(newApplication);
    }

    focus(id: string) {
        this.items.forEach(w => w.focused = false);
        const target = this.items.find(w => w.id === id);
        if (!target) return;
        target.focused = true;
        const maxZ = Math.max(...this.items.map(w => w.zIndex));
        target.zIndex = maxZ + 1;
    }

    maximize(id: string) {
        const target = this.items.find(w => w.id === id);
        if (!target) return;

        if (target.isMaximized) {
            target.position = target.prevPosition ?? target.position;
            target.isMaximized = false;
        } else {
            target.prevPosition = { ...target.position };
            target.isMaximized = true;
        }

        this.focus(id);
    }

    move(id: string, x: number, y: number) {
        const target = this.items.find(w => w.id === id);
        if (!target) return;
        target.position.x = Math.max(0, Math.min(window.innerWidth - target.size.width, x));
        target.position.y = Math.max(0, Math.min(window.innerHeight - target.size.height, y));
    }

    close(id: string) {
        this.items = this.items.filter(n => n.id !== id);
    }

    minimize(id: string) {
        const target = this.items.find(w => w.id === id);
        if (!target) return;
        target.isMinimized = true;
        target.focused = false;
    }

    restoreApp(id: string) {
        const target = this.items.find(w => w.id === id);
        if (!target) return;

        if (target.isMinimized) {
            target.isMinimized = false;
            this.focus(id);
            return;
        }

        if (target.focused) {
            this.minimize(id);
            return;
        }

        this.focus(id);
    }

    getFocusedApp() {
        return this.items.find(w => w.focused)?.id;
    }

    clear() {
        this.items = [];
    }
}

export const WindowStore = new windowStore()
