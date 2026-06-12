let cooldownMs = 30 * 60 * 1000;

const lastAlerted = new Map<string, number>();

export function setCooldown(minutes: number): void {
  cooldownMs = minutes * 60 * 1000;
}

export function canAlert(stationId: string): boolean {
  const last = lastAlerted.get(stationId);
  if (!last) return true;
  return Date.now() - last > cooldownMs;
}

export function markAlerted(stationId: string): void {
  lastAlerted.set(stationId, Date.now());
}

export function cooldownRemainingMs(stationId: string): number {
  const last = lastAlerted.get(stationId);
  if (!last) return 0;
  return Math.max(0, cooldownMs - (Date.now() - last));
}
