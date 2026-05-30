export type AQLevel = 'good' | 'moderate' | 'unhealthy' | 'offline';

export interface AQStatus {
  level: AQLevel;
  label: string;
  color: string;       // hex accent
  bgColor: string;
  textColor: string;
}

const LEVELS: Record<AQLevel, AQStatus> = {
  good:      { level: 'good',      label: 'ดี',              color: '#34a853', bgColor: '#e6f4ea', textColor: '#137333' },
  moderate:  { level: 'moderate',  label: 'ปานกลาง',         color: '#fbbc04', bgColor: '#fef3c7', textColor: '#b45309' },
  unhealthy: { level: 'unhealthy', label: 'มีผลต่อสุขภาพ',  color: '#ea4335', bgColor: '#fce8e6', textColor: '#c5221f' },
  offline:   { level: 'offline',   label: 'ออฟไลน์',         color: '#9aa0a6', bgColor: '#f1f3f4', textColor: '#5f6368' },
};

export function pm25Level(v: number): AQLevel {
  if (v <= 20)   return 'good';
  if (v <= 37.4) return 'moderate';
  return 'unhealthy';
}

export function pm10Level(v: number): AQLevel {
  if (v <= 50)  return 'good';
  if (v <= 99)  return 'moderate';
  return 'unhealthy';
}

export function tspLevel(v: number): AQLevel {
  if (v <= 100) return 'good';
  if (v <= 199) return 'moderate';
  return 'unhealthy';
}

const RANK: Record<AQLevel, number> = { offline: -1, good: 0, moderate: 1, unhealthy: 2 };

// Returns the worst level across all three pollutants.
export function compositeLevel(
  pm25: number | null | undefined,
  pm10: number | null | undefined,
  tsp:  number | null | undefined,
): AQLevel {
  if (pm25 == null && pm10 == null && tsp == null) return 'offline';
  const levels: AQLevel[] = [];
  if (pm25 != null) levels.push(pm25Level(pm25));
  if (pm10 != null) levels.push(pm10Level(pm10));
  if (tsp  != null) levels.push(tspLevel(tsp));
  return levels.reduce((worst, l) => RANK[l] > RANK[worst] ? l : worst, 'good' as AQLevel);
}

export function getStatus(level: AQLevel): AQStatus {
  return LEVELS[level];
}

// Convenience: composite status from a reading object.
export function readingStatus(
  pm25: number | null | undefined,
  pm10: number | null | undefined,
  tsp:  number | null | undefined,
): AQStatus {
  return getStatus(compositeLevel(pm25, pm10, tsp));
}

// True when any pollutant is in the red zone → triggers an alert.
export function isUnhealthy(pm25: number, pm10: number, tsp: number): boolean {
  return pm25Level(pm25) === 'unhealthy'
      || pm10Level(pm10) === 'unhealthy'
      || tspLevel(tsp)   === 'unhealthy';
}
