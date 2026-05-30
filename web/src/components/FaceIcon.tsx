import { AQLevel } from '@/lib/airQuality';

interface FaceIconProps {
  level: AQLevel;
  size?: number;
}

const COLORS: Record<AQLevel, { face: string; feature: string }> = {
  good:      { face: '#34a853', feature: '#000000' },
  moderate:  { face: '#fbbc04', feature: '#000000' },
  unhealthy: { face: '#ea4335', feature: '#000000' },
  offline:   { face: '#9aa0a6', feature: '#ffffff' },
};

export default function FaceIcon({ level, size = 32 }: FaceIconProps) {
  const { face, feature } = COLORS[level];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={level}
    >
      {/* Circle */}
      <circle cx="20" cy="20" r="20" fill={face} />

      {/* Eyes */}
      <ellipse cx="14" cy="16" rx="2.5" ry="3" fill={feature} />
      <ellipse cx="26" cy="16" rx="2.5" ry="3" fill={feature} />

      {/* Mouth — happy, neutral, or sad */}
      {level === 'good' && (
        <path
          d="M12 24 Q20 31 28 24"
          stroke={feature}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {level === 'moderate' && (
        <line
          x1="12" y1="27" x2="28" y2="27"
          stroke={feature}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {(level === 'unhealthy' || level === 'offline') && (
        <path
          d="M12 30 Q20 23 28 30"
          stroke={feature}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}
