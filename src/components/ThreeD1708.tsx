import React, { useState } from 'react';

interface ThreeD1708Props {
  isWon?: boolean;
  className?: string;
}

export const ThreeD1708: React.FC<ThreeD1708Props> = ({ isWon = false, className = '' }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isIvoryTheme, setIsIvoryTheme] = useState(false);

  // Minimalist, crystal-clear 3D isometric cubes
  // Front face is kept upright so digits (1, 7, 0, 8) are 100% legible, sharp, and never distorted.
  // 3D top and lateral faces provide clean physical depth and isometric volume.
  const digits = ['1', '7', '0', '8'];

  // Charcoal theme (matches the black New Puzzle button and dark 1708 wordmark)
  const charcoalStyle = {
    front: '#25231F',
    top: '#3D3832',
    right: '#181614',
    digit: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.12)',
    shadow: '#181614',
  };

  // Ivory ceramic theme (clean warm paper tone)
  const ivoryStyle = {
    front: '#FFFFFF',
    top: '#F7F4EE',
    right: '#D8D1C2',
    digit: '#25231F',
    border: 'rgba(37, 35, 31, 0.14)',
    shadow: '#25231F',
  };

  const currentTheme = isIvoryTheme ? ivoryStyle : charcoalStyle;

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none cursor-pointer ${className}`}
      aria-label="3D 1708 Isometric Cubes"
      role="img"
      onClick={() => setIsIvoryTheme(!isIvoryTheme)}
      title="Click to toggle minimal 3D style (Charcoal / Ivory)"
    >
      <svg
        viewBox="0 0 148 76"
        className="w-full h-full overflow-visible drop-shadow-[0_2px_6px_rgba(37,35,31,0.06)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="cube-ground-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" />
          </filter>
          <linearGradient id="top-glaze" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* 1. Subtle ground contact shadows */}
        <g opacity={isIvoryTheme ? '0.22' : '0.35'} filter="url(#cube-ground-shadow)">
          {digits.map((_, i) => {
            const x = 6 + i * 35;
            return (
              <ellipse
                key={`shadow-${i}`}
                cx={x + 16}
                cy="58"
                rx="14"
                ry="4"
                fill={currentTheme.shadow}
              />
            );
          })}
        </g>

        {/* 2. Four Minimalist 3D Cubes */}
        {digits.map((digit, i) => {
          const x = 6 + i * 35;
          const yBase = 18;
          const isHovered = hoveredIdx === i;
          const yLift = isWon ? Math.sin((i + 1) * 1.5) * 3 : isHovered ? -3 : 0;
          const y = yBase + yLift;

          return (
            <g
              key={digit}
              className="transition-transform duration-200"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* TOP FACE: beveled isometric diamond */}
              <polygon
                points={`${x},${y} ${x + 28},${y} ${x + 34},${y - 6} ${x + 6},${y - 6}`}
                fill={currentTheme.top}
                stroke={currentTheme.border}
                strokeWidth="0.75"
                strokeLinejoin="round"
              />
              <polygon
                points={`${x + 1},${y - 0.5} ${x + 27},${y - 0.5} ${x + 33},${y - 5.5} ${x + 7},${y - 5.5}`}
                fill="url(#top-glaze)"
              />

              {/* RIGHT DEPTH FACE: side shadow creating 3D volume */}
              <polygon
                points={`${x + 28},${y} ${x + 34},${y - 6} ${x + 34},${y + 26} ${x + 28},${y + 32}`}
                fill={currentTheme.right}
                stroke={currentTheme.border}
                strokeWidth="0.75"
                strokeLinejoin="round"
              />

              {/* FRONT FACE: clean, upright plane with subtle rounded corners */}
              <rect
                x={x}
                y={y}
                width="28"
                height="32"
                rx="3.5"
                ry="3.5"
                fill={currentTheme.front}
                stroke={currentTheme.border}
                strokeWidth="0.75"
              />

              {/* CRYSTAL-CLEAR DIGIT: bold, high-contrast, perfectly centered, zero skew */}
              <text
                x={x + 14}
                y={y + 17}
                fill={currentTheme.digit}
                fontSize="19"
                fontWeight="700"
                fontFamily="'Bodoni Moda', 'Playfair Display', Georgia, serif"
                letterSpacing="-0.02em"
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  textRendering: 'geometricPrecision',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                {digit}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
