import React, { useState } from 'react';

interface CubeLogo1708Props {
  isWon?: boolean;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * Pure Monochrome 3D Cubes Logo for 1708
 * Fully adaptive across mobile (Android/iOS) and desktop screens.
 * Uses neutral grayscale (dark black + white) with zero warm/brown/orange tones.
 */
export const CubeLogo1708: React.FC<CubeLogo1708Props> = ({
  isWon = false,
  className = '',
  size = 'md',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cubes = [
    { digit: '1', id: 'cube-1' },
    { digit: '7', id: 'cube-7' },
    { digit: '0', id: 'cube-0' },
    { digit: '8', id: 'cube-8' },
  ];

  // Base dimensions (responsive scale)
  const scale = size === 'xs' ? 0.65 : size === 'sm' ? 0.78 : size === 'lg' ? 1.2 : 0.95;
  const cubeW = 21 * scale;
  const cubeH = 21 * scale;
  const depthX = 4.8 * scale;
  const depthY = 4.8 * scale;
  const gap = 4.5 * scale;

  const totalWidth = (cubeW + depthX + gap) * 4 - gap + 4;
  const totalHeight = cubeH + depthY + 6 * scale;

  return (
    <div
      className={`inline-flex items-center select-none cursor-pointer group ${className}`}
      aria-label="1708 3D Cubes Brand Logo"
      title="1708 - Number Puzzle"
    >
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Neutral soft shadow */}
          <filter id="cube-mono-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>

          {/* Pure neutral black/gray gradients (zero brown or chocolate) */}
          <linearGradient id="cube-mono-front" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#222222" />
            <stop offset="100%" stopColor="#0F0F0F" />
          </linearGradient>

          <linearGradient id="cube-mono-top" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#404040" />
            <stop offset="100%" stopColor="#2E2E2E" />
          </linearGradient>

          <linearGradient id="cube-mono-side" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#141414" />
            <stop offset="100%" stopColor="#080808" />
          </linearGradient>

          {/* Crisp facet outline */}
          <linearGradient id="cube-mono-bevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#555555" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#222222" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {cubes.map((item, idx) => {
          const startX = idx * (cubeW + depthX + gap) + 2;
          const startY = depthY + 1.5;
          const isHovered = hoveredIndex === idx;

          const lift = isHovered
            ? -3 * scale
            : isWon
            ? Math.sin((idx + 1) * 1.5) * 3.5
            : 0;

          const pTop = `${startX},${startY} ${startX + depthX},${startY - depthY} ${startX + cubeW + depthX},${startY - depthY} ${startX + cubeW},${startY}`;
          const pSide = `${startX + cubeW},${startY} ${startX + cubeW + depthX},${startY - depthY} ${startX + cubeW + depthX},${startY + cubeH - depthY} ${startX + cubeW},${startY + cubeH}`;

          return (
            <g
              key={item.id}
              transform={`translate(0, ${lift})`}
              className="transition-transform duration-150 ease-out cursor-pointer"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Neutral drop shadow */}
              <ellipse
                cx={startX + cubeW / 2 + depthX / 2}
                cy={startY + cubeH + 2.5 * scale - lift * 0.3}
                rx={cubeW * 0.55}
                ry={2.5 * scale}
                fill="rgba(0, 0, 0, 0.35)"
                filter="url(#cube-mono-shadow)"
              />

              {/* 1. Top Face */}
              <polygon
                points={pTop}
                fill="url(#cube-mono-top)"
                stroke="#454545"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />

              {/* 2. Side Face */}
              <polygon
                points={pSide}
                fill="url(#cube-mono-side)"
                stroke="#242424"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />

              {/* 3. Front Face */}
              <rect
                x={startX}
                y={startY}
                width={cubeW}
                height={cubeH}
                rx={2 * scale}
                ry={2 * scale}
                fill="url(#cube-mono-front)"
                stroke="url(#cube-mono-bevel)"
                strokeWidth="0.7"
              />

              {/* 4. Digit */}
              <text
                x={startX + cubeW / 2}
                y={startY + cubeH / 2 + 1}
                fill="#FFFFFF"
                fontSize={cubeW * 0.62}
                fontWeight="700"
                fontFamily="'Bodoni Moda', 'Playfair Display', Didot, 'Times New Roman', Georgia, serif"
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  letterSpacing: '-0.02em',
                  textRendering: 'geometricPrecision',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                {item.digit}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
