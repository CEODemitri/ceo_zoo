import React from 'react';

interface RainbowProgressProps {
  completedCount: number;
  totalCount: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// 7 spectral colors from outermost arc (Red) to innermost arc (Violet)
const RAINBOW_COLORS = [
  { name: 'Red', color: '#EF4444' },
  { name: 'Orange', color: '#F97316' },
  { name: 'Yellow', color: '#EAB308' },
  { name: 'Green', color: '#10B981' },
  { name: 'Cyan Blue', color: '#0284C7' },
  { name: 'Indigo', color: '#4F46E5' },
  { name: 'Violet', color: '#9333EA' },
];

export const RainbowProgress: React.FC<RainbowProgressProps> = ({
  completedCount,
  totalCount,
  size = 'md',
  showLabel = true,
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Determine how many of the 7 bows are illuminated (0 to 7)
  const getLitBowsCount = (pct: number, total: number, completed: number): number => {
    if (completed === 0 || pct === 0 || total === 0) return 0;
    if (completed >= total || pct >= 100) return 7;
    // Step by ~14.28% per bow
    const calculated = Math.ceil((pct / 100) * 7);
    return Math.min(6, Math.max(1, calculated));
  };

  const litCount = getLitBowsCount(percentage, totalCount, completedCount);

  // Dimensions configuration for crisp SVG rendering
  const dimensions = {
    sm: { width: 34, height: 20, strokeWidth: 1.5, baseRadius: 16, step: 1.8, fontSize: 'text-[11px]' },
    md: { width: 48, height: 28, strokeWidth: 2, baseRadius: 22, step: 2.6, fontSize: 'text-xs' },
    lg: { width: 68, height: 38, strokeWidth: 2.8, baseRadius: 32, step: 3.8, fontSize: 'text-sm' },
  }[size];

  // SVG viewBox center
  const cx = dimensions.width / 2;
  const cy = dimensions.height - 2;

  return (
    <div className="inline-flex items-center gap-2.5 select-none" title={`Sprint Velocity: ${completedCount}/${totalCount} tasks completed (${percentage}%)`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {RAINBOW_COLORS.map((bow, index) => {
          // Arc 0 is outermost, Arc 6 is innermost
          const radius = dimensions.baseRadius - index * dimensions.step;
          const isLit = index < litCount;
          // Semicircular path from left to right (angles 180 to 0)
          const startX = cx - radius;
          const endX = cx + radius;
          const pathData = `M ${startX} ${cy} A ${radius} ${radius} 0 0 1 ${endX} ${cy}`;

          return (
            <path
              key={bow.name}
              d={pathData}
              fill="none"
              stroke={isLit ? bow.color : 'currentColor'}
              className={isLit ? '' : 'text-[#CFC9BE] dark:text-[#2A2A32]'}
              strokeWidth={dimensions.strokeWidth}
              strokeLinecap="round"
              opacity={isLit ? 1 : 0.75}
            />
          );
        })}
      </svg>

      {showLabel && (
        <div className={`font-mono tabular-nums leading-none ${dimensions.fontSize} text-[#181715] dark:text-[#F3F1EC]`}>
          <span className="font-semibold">{percentage}%</span>
          <span className="text-[#8C867E] dark:text-[#6E6A63] mx-1.5">/</span>
          <span className="text-[#5C5852] dark:text-[#A6A29A] text-[11px] tracking-tight">
            {litCount}/7 BOWS LIT
          </span>
        </div>
      )}
    </div>
  );
};
