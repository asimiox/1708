import React, { useState } from 'react';

interface ThreeD1708Props {
  isWon?: boolean;
  className?: string;
}

export const ThreeD1708: React.FC<ThreeD1708Props> = ({ isWon = false, className = '' }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // 4 floating tiles in pure monochrome dark black + white styling
  const tilesData = [
    {
      digit: '1',
      x: 36,
      y: 92,
      w: 48,
      h: 60,
      rotate: -3,
    },
    {
      digit: '7',
      x: 92,
      y: 68,
      w: 52,
      h: 64,
      rotate: -7,
    },
    {
      digit: '0',
      x: 154,
      y: 44,
      w: 54,
      h: 66,
      rotate: -11,
    },
    {
      digit: '8',
      x: 218,
      y: 20,
      w: 56,
      h: 68,
      rotate: -15,
    },
  ];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      aria-label="3D 1708 Floating Tiles"
      role="img"
    >
      <svg
        viewBox="0 0 310 180"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Neutral soft drop shadow */}
          <filter id="tile-ambient-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
            <feOffset dx="2" dy="10" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.14" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Neutral contact shadow */}
          <filter id="tile-contact-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>

          {/* Clean neutral face gradient */}
          <linearGradient id="mono-tile-face" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FAFAFA" />
            <stop offset="100%" stopColor="#EEEEEE" />
          </linearGradient>

          {/* Neutral beveled edge */}
          <linearGradient id="mono-tile-edge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5E5E5" />
            <stop offset="100%" stopColor="#D4D4D4" />
          </linearGradient>

          {/* Subtle sheen */}
          <linearGradient id="mono-tile-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Neutral Orbital Wireframe Rings */}
        <g opacity="0.4" fill="none" stroke="#888888" strokeWidth="1">
          <ellipse cx="160" cy="88" rx="140" ry="62" transform="rotate(-14 160 88)" />
          <ellipse cx="165" cy="85" rx="115" ry="48" strokeDasharray="3 3" opacity="0.6" transform="rotate(-12 165 85)" />
        </g>

        {/* 2. Neutral Contact Ground Shadows */}
        <g opacity="0.25" filter="url(#tile-contact-shadow)">
          {tilesData.map((t, idx) => (
            <ellipse
              key={`shadow-${idx}`}
              cx={t.x + t.w / 2 + 4}
              cy={t.y + t.h + 8}
              rx={t.w * 0.52}
              ry={t.h * 0.2}
              fill="#000000"
              transform={`rotate(${t.rotate} ${t.x + t.w / 2} ${t.y + t.h / 2})`}
            />
          ))}
        </g>

        {/* 3. Four Floating 3D Monochrome Tiles */}
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
              {/* Tile 3D extruded edge */}
              <rect
                x={tile.x + 2}
                y={tile.y + 3}
                width={tile.w}
                height={tile.h}
                rx="8"
                ry="8"
                fill="url(#mono-tile-edge)"
                stroke="#C4C4C4"
                strokeWidth="0.8"
              />

              {/* Tile front face */}
              <rect
                x={tile.x}
                y={tile.y}
                width={tile.w}
                height={tile.h}
                rx="7"
                ry="7"
                fill="url(#mono-tile-face)"
                stroke="#D4D4D4"
                strokeWidth="0.8"
              />

              {/* Sheen highlight */}
              <rect
                x={tile.x + 1}
                y={tile.y + 1}
                width={tile.w - 2}
                height={tile.h * 0.45}
                rx="6"
                ry="6"
                fill="url(#mono-tile-sheen)"
              />

              {/* Digit in pure deep neutral black */}
              <text
                x={cx}
                y={cy + 1}
                fill="#0A0A0A"
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
