import type { WidgetInterface as Widget } from "@/components/widgetsRenderer/types";

export interface AppDescriptor {
  id: string;
  title: string;
  applicationTag: string;
  sourceUrl: string;
  image?: string;
  size?: { width: number; height: number };
}

export interface PreferencesConfig {
  widgets: Widget[];
  apps: AppDescriptor[];
  [key: string]: unknown;
}