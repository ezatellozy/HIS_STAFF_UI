import React, { useId } from 'react';

interface EdinaLogoProps {
  variant?: 'full' | 'mark-only' | 'text-only' | 'compact';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const EdinaLogo: React.FC<EdinaLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  className = '',
  size = 'md',
  showSubtitle = false
}) => {
  const uniqueId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const heartGradId = `edinaHeartGrad_${uniqueId}`;
  const handGradId = `edinaHandGrad_${uniqueId}`;
  const crossGradId = `edinaCrossGrad_${uniqueId}`;

  // Size mapping
  const sizeStyles = {
    xs: { iconSize: 22, textClass: 'text-sm', hisClass: 'text-sm', gap: 'gap-1.5' },
    sm: { iconSize: 28, textClass: 'text-base', hisClass: 'text-base', gap: 'gap-2' },
    md: { iconSize: 36, textClass: 'text-xl', hisClass: 'text-xl', gap: 'gap-2.5' },
    lg: { iconSize: 48, textClass: 'text-2xl sm:text-3xl', hisClass: 'text-2xl sm:text-3xl', gap: 'gap-3' },
    xl: { iconSize: 64, textClass: 'text-4xl', hisClass: 'text-4xl', gap: 'gap-4' }
  };

  const currentSize = sizeStyles[size];

  // Theme text color mapping
  const edinaColorClass =
    theme === 'dark'
      ? 'text-white'
      : theme === 'light'
      ? 'text-[#0B4EB8]'
      : 'text-slate-900 dark:text-white';

  const RenderMark = ({ iconSize }: { iconSize: number }) => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm select-none"
      aria-label="Edina HIS Heart Icon"
    >
      <defs>
        {/* Heart outer gradient: Cyan to Royal Blue */}
        <linearGradient id={heartGradId} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#00E5C8" />
          <stop offset="25%" stopColor="#00C9B7" />
          <stop offset="55%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0B4EB8" />
        </linearGradient>

        {/* Hand gradient: Bright Cyan / Turquoise */}
        <linearGradient id={handGradId} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#00E5C8" />
          <stop offset="100%" stopColor="#00B4D8" />
        </linearGradient>

        {/* Central Cross gradient: Solid Royal Blue */}
        <linearGradient id={crossGradId} x1="20%" y1="20%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#1E65DE" />
          <stop offset="100%" stopColor="#0B4EB8" />
        </linearGradient>
      </defs>

      {/* Floating digital pixels (Top Left) */}
      <rect x="22" y="8" width="13" height="13" rx="3.5" fill="#00E5C8" />
      <rect x="3" y="16" width="13" height="13" rx="3.5" fill="#00DFCE" />
      <rect x="18" y="27" width="14" height="14" rx="3.5" fill="#00D2B4" />
      <rect x="3" y="37" width="12" height="12" rx="3" fill="#00C9B7" />

      {/* Main Heart Ribbon Contour */}
      <path
        d="M80 148 C68 138 28 104 22 72 C16 46 32 20 58 18 C70 17 76 22 80 27 C84 22 90 17 102 18 C128 20 144 46 138 72 C132 104 92 138 80 148 Z"
        stroke={`url(#${heartGradId})`}
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Supporting Caring Hand along lower left interior */}
      <path
        d="M33 92 C33 92 42 120 74 136 C66 128 58 112 58 100 C58 92 48 88 40 89 C36 89 33 92 33 92 Z"
        fill={`url(#${handGradId})`}
      />
      <path
        d="M44 98 C50 112 60 123 72 132 C58 126 50 114 47 103 C46 100 44 98 44 98 Z"
        fill="#FFFFFF"
        opacity="0.3"
      />

      {/* Central Medical Cross (+) */}
      <g>
        {/* Vertical Cross Bar */}
        <rect
          x="69"
          y="48"
          width="22"
          height="54"
          rx="8"
          fill={`url(#${crossGradId})`}
        />
        {/* Horizontal Cross Bar */}
        <rect
          x="53"
          y="64"
          width="54"
          height="22"
          rx="8"
          fill={`url(#${crossGradId})`}
        />
      </g>
    </svg>
  );

  if (variant === 'mark-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <RenderMark iconSize={currentSize.iconSize} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className} select-none`}>
      {/* Icon Mark */}
      <RenderMark iconSize={currentSize.iconSize} />

      {/* Typography Lockup */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight leading-none">
          <span
            className={`font-black ${currentSize.textClass} ${edinaColorClass} font-['Plus_Jakarta_Sans',sans-serif] mr-1.5`}
          >
            Edina
          </span>
          <span
            className={`font-black ${currentSize.hisClass} bg-gradient-to-r from-[#00C2CB] via-[#00B4D8] to-[#0284C7] bg-clip-text text-transparent font-['Plus_Jakarta_Sans',sans-serif]`}
          >
            HIS
          </span>
        </div>

        {showSubtitle && (
          <span className="text-[10px] text-slate-400 font-medium tracking-normal mt-0.5">
            نظام إدارة المستشفيات السريري
          </span>
        )}
      </div>
    </div>
  );
};
