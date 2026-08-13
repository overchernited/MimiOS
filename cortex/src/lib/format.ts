export function formatBytes(n: number) {
  if (!n || n <= 0) return '—';

  if (n < 1024) return `${n} B`;

  const units = ['KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(n) / Math.log(1024));
  const value = n / Math.pow(1024, i);
  const unit = units[i - 1];

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`;
}