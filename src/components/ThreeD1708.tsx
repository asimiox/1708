import React, { useState } from 'react';

interface ThreeD1708Props {
  isWon?: boolean;
  className?: string;
}

export const ThreeD1708: React.FC<ThreeD1708Props> = ({ isWon = false, className = '' }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Four tactile isometric digit blocks with crystal-clear legibility
  // 1: Terracotta block with clean white numerals
  // 7: Off-white ivory ceramic block with dark charcoal numerals
  // 0: Warm amber/camel block with clean white numerals
  // 8: Deep rich espresso block with crisp white numerals
  const blocks = [
    {
      digit: '1',
      top: '#DE7A47',      // highlighted top face
      left: '#B8562B',     // primary front-left face (where digit is printed)
      right: '#96411C',    // shaded right face
      digitColor: '#FFFFFF',
      border: 'rgba(255, 255, 255, 0.22)',
    },
    {
      digit: '7',
      top: '#FFFFFF',
      left: '#FFFDF8',
      right: '#DDD5C7',
      digitColor: '#25231F',
      border: 'rgba(37, 35, 31, 0.16)',
    },
    {
      digit: '0',
      top: '#E89D52',
      left: '#C77A32',
      right: '#A0591B',
      digitColor: '#FFFFFF',
      border: 'rgba(255, 255, 255, 0.22)',
    },
    {
      digit: '8',
      top: '#473D35',
      left: '#2E2721',
      right: '#1E1915',
      digitColor: '#FFFFFF',
      border: 'rgba(255, 255, 255, 0.18)',
    },
  ];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      aria-label="3D 1708 Isometric Target"
      role="img"
    >
      <svg
        viewBox="0 0 168 96"
        className="w-full h-full overflow-visible drop-shadow-[0_4px_10px_rgba(37,35,31,0.08)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Ground contact soft shadows under each isometric cube */}
          <filter id="soft-ground-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" />
          </filter>
          <linearGradient id="cube-shine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* 1. Contact Shadows on the table plane */}
        <g opacity="0.32" filter="url(#soft-ground-shadow)">
          <ellipse cx="28" cy="80" rx="19" ry="7" fill="#1E1813" />
          <ellipse cx="64" cy="80" rx="19" ry="7" fill="#1E1813" />
          <ellipse cx="100" cy="80" rx="19" ry="7" fill="#1E1813" />
          <ellipse cx="136" cy="80" rx="19" ry="7" fill="#1E1813" />
        </g>

        {/* 2. Four Isometric Cubes */}
        {blocks.map((block, i) => {
          // X-offset for horizontal arrangement with tight, pleasant spacing
          const xOffset = 8 + i * 36;
          // Subtle celebratory floating offset or hover lift
          const isHovered = hoveredIdx === i;
          const yLift = isWon ? Math.sin((i + 1) * 1.5) * 4 : isHovered ? -4 : 0;
          const yOffset = 18 + yLift;

          return (
            <g
              key={block.digit}
              transform={`translate(${xOffset}, ${yOffset})`}
              className="transition-transform duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* TOP FACE: diamond polygon (0,10) -> (17,0) -> (34,10) -> (17,20) */}
              <polygon
                points="17,0 34,10 17,20 0,10"
                fill={block.top}
                stroke={block.border}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
              {/* Top Face subtle bevel sheen */}
              <polygon
                points="17,1 33,10 17,19 1,10"
                fill="url(#cube-shine)"
                opacity="0.3"
              />

              {/* RIGHT FACE (shaded depth side): (17,20) -> (34,10) -> (34,44) -> (17,54) */}
              <polygon
                points="17,20 34,10 34,44 17,54"
                fill={block.right}
                stroke={block.border}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              {/* LEFT/FRONT FACE (main viewing face where number is rendered):
                  (0,10) -> (17,20) -> (17,54) -> (0,44) */}
              <polygon
                points="0,10 17,20 17,54 0,44"
                fill={block.left}
                stroke={block.border}
                strokeWidth="0.8"
                strokeLinejoin="round"
              />

              {/* Subtle inner edge highlight on the front corner ridge */}
              <line
                x1="17"
                y1="20"
                x2="17"
                y2="54"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />

              {/* Crystal-Clear, Bold, Elegantly Projected Digit on the front-left face
                  Using SVG matrix transformation to perfectly align with isometric skew:
                  Horizontal slant: skewY(30.96) or standard isometric projection matrix */}
              <g transform="matrix(0.9659, 0.557, 0, 1, 1.5, 9.5)">
                <text
                  x="7.5"
                  y="30"
                  fill={block.digitColor}
                  fontFamily="'Bodoni Moda', 'Playfair Display', Georgia, serif"
                  fontSize="22"
                  fontWeight="800"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    letterSpacing: '-0.02em',
                    filter:
                      block.digitColor === '#FFFFFF'
                        ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))'
                        : 'drop-shadow(0 1px 0 rgba(255,255,255,0.4))',
                  }}
                >
                  {block.digit}
                </text>
              </g>

              {/* Also a crisp, subtle indicator on the top face for rich 3D immersion */}
              <circle
                cx="17"
                cy="10"
                r="1.8"
                fill={block.digitColor}
                opacity={block.digitColor === '#FFFFFF' ? '0.45' : '0.25'}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
