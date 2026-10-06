import React from 'react';

interface OfficialLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'emblem' | 'white';
}

export const OfficialLogo: React.FC<OfficialLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  const sizeMap = {
    sm: { w: 140, h: 48, iconSize: 38 },
    md: { w: 200, h: 68, iconSize: 52 },
    lg: { w: 260, h: 90, iconSize: 72 },
    xl: { w: 320, h: 110, iconSize: 96 },
  };

  const { iconSize } = sizeMap[size];

  // The Emblem SVG containing the circular seal, OMR sheet, Test Report, Graduation Cap, Open Book & Student
  const Emblem = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm"
    >
      {/* Outer Thick Orange Ring */}
      <circle cx="100" cy="100" r="86" stroke="#F97316" strokeWidth="14" fill="#FFFFFF" />

      {/* Left Top: Slanted OMR Bubble Sheet */}
      <g transform="translate(38, 22) rotate(-16) scale(0.65)">
        <rect x="0" y="0" width="56" height="74" rx="4" fill="#FFFFFF" stroke="#0284C7" strokeWidth="3" />
        {/* OMR Dots */}
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <g key={row} transform={`translate(8, ${12 + row * 9})`}>
            <circle cx="5" cy="4" r="3" fill="#F97316" />
            <circle cx="15" cy="4" r="3" fill="#0284C7" />
            <circle cx="25" cy="4" r="3" fill="#0284C7" />
            <circle cx="35" cy="4" r="3" fill="#F97316" />
          </g>
        ))}
      </g>

      {/* Right Top: Slanted Test Report Chart */}
      <g transform="translate(116, 12) rotate(14) scale(0.65)">
        <rect x="0" y="0" width="60" height="78" rx="4" fill="#FFFFFF" stroke="#0369A1" strokeWidth="3" />
        <text x="7" y="14" fill="#0F172A" fontSize="7" fontWeight="bold" fontFamily="sans-serif">TEST REPORT</text>
        <line x1="6" y1="18" x2="54" y2="18" stroke="#E2E8F0" strokeWidth="2" />
        {/* Bar chart */}
        <rect x="10" y="44" width="7" height="18" fill="#F97316" rx="1" />
        <rect x="21" y="32" width="7" height="30" fill="#0284C7" rx="1" />
        <rect x="32" y="24" width="7" height="38" fill="#F97316" rx="1" />
        <rect x="43" y="16" width="7" height="46" fill="#10B981" rx="1" />
        {/* Ascending Trend Arrow */}
        <path d="M8 50 L24 35 L35 30 L48 15" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
        <polygon points="45,13 52,14 50,21" fill="#EA580C" />
      </g>

      {/* Center Open Book Base Layers */}
      <g transform="translate(100, 118)">
        {/* Lower Orange Wings */}
        <path
          d="M 0,-6 Q -42,16 -70,22 Q -38,36 0,26 Q 38,36 70,22 Q 42,16 0,-6 Z"
          fill="#EA580C"
        />
        {/* Royal Blue Book Pages */}
        <path
          d="M 0,-14 Q -38,4 -64,10 Q -32,24 0,16 Q 32,24 64,10 Q 38,4 0,-14 Z"
          fill="#1E40AF"
        />
        <path
          d="M 0,-20 Q -34,-2 -56,2 Q -28,14 0,8 Q 28,14 56,2 Q 34,-2 0,-20 Z"
          fill="#2563EB"
        />
      </g>

      {/* Rejoicing Student Silhouette (Arms Raised) */}
      <g transform="translate(100, 94)">
        {/* Student Head */}
        <circle cx="0" cy="-12" r="7.5" fill="#FFFFFF" />
        {/* Student Body & Upraised Arms in Victory */}
        <path
          d="M 0,-3 
             C -9,-8 -17,-18 -18,-24 
             C -16,-24 -11,-15 -4,-9 
             L -5,12 
             L 5,12 
             L 4,-9 
             C 11,-15 16,-24 18,-24 
             C 17,-18 9,-8 0,-3 Z"
          fill="#FFFFFF"
        />
      </g>

      {/* Graduation Cap (Navy Blue with Golden Tassel) */}
      <g transform="translate(100, 70)">
        {/* Cap Diamond Top */}
        <polygon points="0,-16 48,-2 0,12 -48,-2" fill="#0F172A" stroke="#1E293B" strokeWidth="2" />
        {/* Cap Skull Base */}
        <path d="M -24,4 L -24,14 C -24,24 24,24 24,14 L 24,4 Z" fill="#1E293B" />
        {/* Golden Tassel */}
        <circle cx="0" cy="-2" r="3.5" fill="#F59E0B" />
        <path d="M 0,-2 Q 22,6 24,20" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="22" r="3" fill="#D97706" />
      </g>
    </svg>
  );

  if (variant === 'emblem') {
    return <div className={`inline-flex items-center ${className}`}>{Emblem}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {Emblem}
      <div className="flex flex-col text-left leading-tight">
        <span
          className={`font-extrabold tracking-tight ${
            variant === 'white' ? 'text-white' : 'text-orange-600'
          } ${size === 'sm' ? 'text-base' : size === 'md' ? 'text-xl' : 'text-2xl'}`}
        >
          ATTA <span className={variant === 'white' ? 'text-amber-300' : 'text-orange-500'}>Samejo</span>
        </span>
        <span
          className={`font-semibold tracking-wider ${
            variant === 'white' ? 'text-blue-100' : 'text-slate-800'
          } ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
        >
          — Educational Hub —
        </span>
        <span
          className={`font-bold tracking-widest uppercase ${
            variant === 'white' ? 'text-blue-200' : 'text-orange-600'
          } ${size === 'sm' ? 'text-[9px]' : 'text-[10px]'}`}
        >
          TESTS • FORMS • RESULTS • ANALYZE
        </span>
      </div>
    </div>
  );
};
