// In-memory cooldown: prevents spamming the same station alert.
// Cooldown period defaults to 30 minutes.
const COOLDOWN_MS = 30 * 60 * 1000;

const lastAlerted = new Map<string, number>();

export function canAlert(stationId: string): boolean {
  const last = lastAlerted.get(stationId);
  if (!last) return true;
  return Date.now() - last > COOLDOWN_MS;
}

export function markAlerted(stationId: string): void {
  lastAlerted.set(stationId, Date.now());
}

export function cooldownRemainingMs(stationId: string): number {
  const last = lastAlerted.get(stationId);
  if (!last) return 0;
  return Math.max(0, COOLDOWN_MS - (Date.now() - last));
}
