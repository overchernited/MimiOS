import type { LogEntry } from '@/types/logs.types';



class logStore {
  items = $state<LogEntry[]>([]);

  add(entry: LogEntry) {
    this.items.push(entry)
  }

  clear() {
    this.items = [];
  }
}

export const LogStore = new logStore();
