import React, { useState } from 'react';

interface ThreeD1708Props {
  isWon?: boolean;
  className?: string;
}

export const ThreeD1708: React.FC<ThreeD1708Props> = ({ isWon = false, className = '' }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 4 floating tactile porcelain tiles matching the exact reference image
  // Arranged in an ascending, slightly rotated 3D perspective with orbital rings behind
  const tilesData = [
    {
      digit: '1',
      x: 36,
      y: 92,
      w: 48,
      h: 60,
      rotate: -3,
      shadowOffset: 8,
    },
    {
      digit: '7',
      x: 92,
      y: 68,
      w: 52,
      h: 64,
      rotate: -7,
      shadowOffset: 10,
    },
    {
      digit: '0',
      x: 154,
      y: 44,
      w: 54,
      h: 66,
      rotate: -11,
      shadowOffset: 12,
    },
    {
      digit: '8',
      x: 218,
      y: 20,
      w: 56,
      h: 68,
      rotate: -15,
      shadowOffset: 14,
    },
  ];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      aria-label="3D 1708 Porcelain Floating Tiles"
      role="img"
    >
      <svg
        viewBox="0 0 310 180"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Porcelain soft ambient drop shadow */}
          <filter id="tile-ambient-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
            <feOffset dx="4" dy="12" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.16" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Deep contact shadow */}
          <filter id="tile-contact-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" />
          </filter>

          {/* Porcelain face gradient with subtle top-left ambient light */}
          <linearGradient id="porcelain-face" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FAF7F2" />
            <stop offset="100%" stopColor="#EDE6D8" />
          </linearGradient>

          {/* Beveled edge gradient */}
          <linearGradient id="porcelain-edge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5EFE3" />
            <stop offset="100%" stopColor="#D5CBB8" />
          </linearGradient>

          {/* Specular sheen */}
          <linearGradient id="porcelain-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Elegant Orbital Wireframe Rings behind the tiles (as in reference image) */}
        <g opacity="0.55" fill="none" stroke="#D3CBBB" strokeWidth="1">
          {/* Main sweeping orbital ellipse */}
          <ellipse cx="160" cy="88" rx="140" ry="62" transform="rotate(-14 160 88)" />
          {/* Secondary concentric orbital curve */}
          <ellipse cx="165" cy="85" rx="115" ry="48" strokeDasharray="3 3" opacity="0.6" transform="rotate(-12 165 85)" />
        </g>

        {/* 2. Soft Contact Ground Shadows underneath tiles */}
        <g opacity="0.3" filter="url(#tile-contact-shadow)">
          {tilesData.map((t, idx) => (
            <ellipse
              key={`shadow-${idx}`}
              cx={t.x + t.w / 2 + 6}
              cy={t.y + t.h + 10}
              rx={t.w * 0.55}
              ry={t.h * 0.22}
              fill="#25231F"
              transform={`rotate(${t.rotate} ${t.x + t.w / 2} ${t.y + t.h / 2})`}
            />
          ))}
        </g>

        {/* 3. Four Floating 3D Porcelain Tiles */}
        {tilesData.map((tile, i) => {
          const isHovered = hoveredIdx === i;
          const yLift = isWon ? Math.sin((i + 1) * 1.5) * 6 : isHovered ? -5 : 0;
          const cx = tile.x + tile.w / 2;
          const cy = tile.y + tile.h / 2;

          return (
            <g
              key={tile.digit}
              transform={`translate(0, ${yLift}) rotate(${tile.rotate} ${cx} ${cy})`}
              className="transition-transform duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              filter="url(#tile-ambient-shadow)"
            >
              {/* Tile 3D extruded back/side edge for physical thickness */}
              <rect
                x={tile.x + 2}
                y={tile.y + 3}
                width={tile.w}
                height={tile.h}
                rx="9"
                ry="9"
                fill="url(#porcelain-edge)"
                stroke="#C7BDAB"
                strokeWidth="0.8"
              />

              {/* Tile front face */}
              <rect
                x={tile.x}
                y={tile.y}
                width={tile.w}
                height={tile.h}
                rx="8"
                ry="8"
                fill="url(#porcelain-face)"
                stroke="#DDD4C4"
                strokeWidth="0.8"
              />

              {/* Subtle top bevel highlight */}
              <rect
                x={tile.x + 1}
                y={tile.y + 1}
                width={tile.w - 2}
                height={tile.h * 0.45}
                rx="7"
                ry="7"
                fill="url(#porcelain-sheen)"
              />

              {/* High-contrast, clean Bodoni serif digit */}
              <text
                x={cx}
                y={cy + 1}
                fill="#25231F"
                fontSize={tile.w * 0.58}
                fontWeight="600"
                fontFamily="'Bodoni Moda', 'Playfair Display', Didot, Georgia, serif"
                letterSpacing="-0.03em"
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  textRendering: 'geometricPrecision',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                {tile.digit}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
