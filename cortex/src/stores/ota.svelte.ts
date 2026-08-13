type OtaPhase = 'idle' | 'downloading' | 'flashing';

class otaStore {
  active = $state(false);
  itemId = $state<string | null>(null);
  itemName = $state('');
  phase = $state<OtaPhase>('idle');
  progress = $state(0);

  start(id: string, name: string) {
    this.active = true;
    this.itemId = id;
    this.itemName = name;
    this.phase = 'downloading';
    this.progress = 0;
  }

  downloading() {
    this.phase = 'downloading';
  }

  flashing() {
    this.phase = 'flashing';
  }

  setProgress(p: number) {
    this.progress = Math.max(0, Math.min(100, Math.round(p)));
  }

  finish() {
    this.active = false;
    this.itemId = null;
    this.itemName = '';
    this.phase = 'idle';
    this.progress = 0;
  }
}

export const OtaStore = new otaStore();
