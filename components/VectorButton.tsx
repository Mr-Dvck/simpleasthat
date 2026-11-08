'use client';

import React, { useState, useId, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import clsx, { ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type VectorButtonVariant = 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose' | 'ghost';
export type VectorButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface VectorButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VectorButtonVariant;
  size?: VectorButtonSize;
  activeSelected?: boolean;
  fullWidth?: boolean;
  badgeText?: string;
  iconOnly?: boolean;
  showLockGlyph?: boolean;
  children: React.ReactNode;
}

const VARIANT_CONFIG: Record<
  VectorButtonVariant,
  {
    stroke: string;
    glowColor: string;
    cornerColor: string;
    defaultBorder: string;
    defaultGlow: string;
    hoverGlow: string;
    activeGlow: string;
    selectedBorder: string;
    selectedGlow: string;
    activeBg: string;
    textClass: string;
  }
> = {
  cyan: {
    stroke: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    cornerColor: '#22d3ee',
    defaultBorder: 'border-cyan-500/35',
    defaultGlow: 'shadow-[0_0_12px_rgba(6,182,212,0.22)]',
    hoverGlow: 'hover:shadow-[0_0_24px_rgba(6,182,212,0.52)] hover:border-cyan-400/80',
    activeGlow: 'active:shadow-[inset_0_4px_14px_rgba(0,0,0,0.92),0_0_12px_rgba(6,182,212,0.30)]',
    selectedBorder: 'border-cyan-400',
    selectedGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.55)]',
    activeBg: 'from-cyan-500/20 via-[#050505] to-purple-600/20',
    textClass: 'text-cyan-50',
  },
  amber: {
    stroke: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    cornerColor: '#fbbf24',
    defaultBorder: 'border-amber-500/40',
    defaultGlow: 'shadow-[0_0_12px_rgba(245,158,11,0.22)]',
    hoverGlow: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.52)] hover:border-amber-400/85',
    activeGlow: 'active:shadow-[inset_0_4px_14px_rgba(0,0,0,0.92),0_0_12px_rgba(245,158,11,0.30)]',
    selectedBorder: 'border-amber-400',
    selectedGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.55)]',
    activeBg: 'from-amber-500/25 via-[#050505] to-orange-600/20',
    textClass: 'text-amber-50',
  },
  emerald: {
    stroke: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    cornerColor: '#34d399',
    defaultBorder: 'border-emerald-500/35',
    defaultGlow: 'shadow-[0_0_12px_rgba(16,185,129,0.22)]',
    hoverGlow: 'hover:shadow-[0_0_24px_rgba(16,185,129,0.50)] hover:border-emerald-400/80',
    activeGlow: 'active:shadow-[inset_0_4px_14px_rgba(0,0,0,0.92),0_0_12px_rgba(16,185,129,0.30)]',
    selectedBorder: 'border-emerald-400',
    selectedGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.55)]',
    activeBg: 'from-emerald-500/20 via-[#050505] to-teal-600/20',
    textClass: 'text-emerald-50',
  },
  purple: {
    stroke: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    cornerColor: '#c084fc',
    defaultBorder: 'border-purple-500/35',
    defaultGlow: 'shadow-[0_0_12px_rgba(168,85,247,0.22)]',
    hoverGlow: 'hover:shadow-[0_0_24px_rgba(168,85,247,0.50)] hover:border-purple-400/80',
    activeGlow: 'active:shadow-[inset_0_4px_14px_rgba(0,0,0,0.92),0_0_12px_rgba(168,85,247,0.30)]',
    selectedBorder: 'border-purple-400',
    selectedGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.55)]',
    activeBg: 'from-purple-600/20 via-[#050505] to-amber-500/15',
    textClass: 'text-purple-50',
  },
  rose: {
    stroke: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    cornerColor: '#fb7185',
    defaultBorder: 'border-rose-500/35',
    defaultGlow: 'shadow-[0_0_12px_rgba(244,63,94,0.22)]',
    hoverGlow: 'hover:shadow-[0_0_24px_rgba(244,63,94,0.50)] hover:border-rose-400/80',
    activeGlow: 'active:shadow-[inset_0_4px_14px_rgba(0,0,0,0.92),0_0_12px_rgba(244,63,94,0.30)]',
    selectedBorder: 'border-rose-400',
    selectedGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.55)]',
    activeBg: 'from-rose-500/20 via-[#050505] to-amber-600/15',
    textClass: 'text-rose-50',
  },
  ghost: {
    stroke: '#9ca3af',
    glowColor: 'rgba(6, 182, 212, 0.28)',
    cornerColor: '#06b6d4',
    defaultBorder: 'border-white/10',
    defaultGlow: 'shadow-[0_0_8px_rgba(255,255,255,0.03)]',
    hoverGlow: 'hover:shadow-[0_0_18px_rgba(6,182,212,0.32)] hover:border-cyan-400/50 hover:text-white',
    activeGlow: 'active:shadow-[inset_0_4px_14px_rgba(0,0,0,0.92)]',
    selectedBorder: 'border-cyan-400/70',
    selectedGlow: 'shadow-[0_0_16px_rgba(6,182,212,0.40)]',
    activeBg: 'from-white/5 via-[#050505] to-white/[0.02]',
    textClass: 'text-gray-200',
  },
};

const SIZE_CLASSES: Record<VectorButtonSize, string> = {
  xs: 'min-h-[36px] px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] rounded-xl gap-1',
  sm: 'min-h-[40px] px-2 sm:px-3 py-2 text-[11px] sm:text-xs rounded-xl gap-1 sm:gap-1.5',
  md: 'min-h-[44px] px-3 sm:px-4 py-2.5 text-xs sm:text-sm rounded-2xl gap-1.5 sm:gap-2',
  lg: 'min-h-[50px] px-3.5 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-base rounded-2xl gap-1.5 sm:gap-2.5',
};

const ICON_ONLY_SIZE_CLASSES: Record<VectorButtonSize, string> = {
  xs: 'w-9 h-9 min-h-[36px] min-w-[36px] p-0 rounded-xl justify-center shrink-0',
  sm: 'w-10 h-10 min-h-[40px] min-w-[40px] p-0 rounded-xl justify-center shrink-0',
  md: 'w-11 h-11 min-h-[44px] min-w-[44px] p-0 rounded-2xl justify-center shrink-0',
  lg: 'w-12 h-12 min-h-[48px] min-w-[48px] p-0 rounded-2xl justify-center shrink-0',
};

/**
 * Custom SVG Lock Glyph rendered explicitly when button is in Disabled state
 */
export function VectorLockGlyph({
  className = 'w-3.5 h-3.5 shrink-0',
  color,
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Locked"
      data-lock-glyph="true"
    >
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="1.75"
        stroke={color || 'currentColor'}
        strokeWidth="1.5"
        fill="rgba(5,5,5,0.85)"
      />
      <path
        d="M5.25 7V5.25C5.25 3.73122 6.48122 2.5 8 2.5C9.51878 2.5 10.75 3.73122 10.75 5.25V7"
        stroke={color || 'currentColor'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="10.5" r="1" fill={color || 'currentColor'} />
    </svg>
  );
}

/**
 * Dedicated Dark Glassmorphism SVG Vector Button
 * Theme: #050505 void base, 1px border-white/10 + neon cyan/amber glow borders
 * States:
 *  - Default: #050505 void, 1px border-white/10 / neon border, dedicated vector corner brackets
 *  - Hover: subtle brightness (brightness-110) + neon glow expansion
 *  - Active/Pressed: scale(0.96) with deep inset shadow
 *  - Disabled: muted opacity (0.45) with explicit SVG lock glyph
 */
const VectorButton = forwardRef<HTMLButtonElement, VectorButtonProps>(function VectorButton(
  {
    variant = 'cyan',
    size = 'md',
    activeSelected = false,
    fullWidth = false,
    badgeText,
    iconOnly = false,
    showLockGlyph,
    disabled = false,
    className = '',
    type = 'button',
    children,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    onMouseEnter,
    onMouseLeave,
    ...rest
  },
  ref
) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const rawId = useId();
  const gradId = `vec-grad-${variant}-${rawId.replace(/[^a-zA-Z0-9-_]/g, '')}`;

  const cfg = VARIANT_CONFIG[variant];
  const sizeCls = iconOnly ? ICON_ONLY_SIZE_CLASSES[size] : SIZE_CLASSES[size];

  const shouldShowLock = showLockGlyph !== undefined ? showLockGlyph && disabled : disabled;

  const visualState = disabled
    ? 'disabled'
    : isPressed
    ? 'pressed'
    : isHovered
    ? 'hover'
    : 'default';

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!disabled) setIsPressed(true);
    onPointerDown?.(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    onPointerUp?.(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    setIsHovered(false);
    onPointerLeave?.(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) setIsHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    setIsPressed(false);
    onMouseLeave?.(e);
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      data-vector-btn="true"
      data-variant={variant}
      data-btn-state={visualState}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        // Base Glassmorphism Void Container
        'group relative inline-flex items-center justify-center font-black uppercase tracking-tight sm:tracking-wider select-none overflow-hidden touch-manipulation',
        'bg-[#050505] bg-gradient-to-br',
        cfg.activeBg,
        'border',
        // Border & Glow State Rules
        activeSelected
          ? `${cfg.selectedBorder} ${cfg.selectedGlow}`
          : `${cfg.defaultBorder} ${cfg.defaultGlow}`,
        cfg.textClass,
        sizeCls,
        fullWidth ? 'w-full' : 'shrink-0',
        // State Transitions: Default -> Hover -> Active -> Disabled
        'transition-all duration-150 ease-out',
        disabled
          ? 'opacity-45 cursor-not-allowed saturate-50'
          : [
              'cursor-pointer',
              'hover:brightness-110',
              cfg.hoverGlow,
              cfg.activeGlow,
              'active:scale-[0.96] active:shadow-[inset_0_4px_14px_rgba(0,0,0,0.92)]',
              isPressed ? 'scale-[0.96] shadow-[inset_0_4px_14px_rgba(0,0,0,0.92)]' : '',
            ].join(' '),
        className
      )}
      {...rest}
    >
      {/* SVG Vector Glass Reticle Border Overlay with Non-Scaling Stroke */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full rounded-[inherit] overflow-hidden"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={cfg.cornerColor}
              stopOpacity={activeSelected ? '0.85' : '0.45'}
            />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.09" />
            <stop
              offset="100%"
              stopColor={cfg.stroke}
              stopOpacity={activeSelected ? '0.85' : '0.45'}
            />
          </linearGradient>
        </defs>

        <rect
          x="0.5"
          y="0.5"
          width="99"
          height="99"
          rx="8"
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          strokeDasharray={activeSelected ? 'none' : '28 4'}
        />
      </svg>

      {/* Dedicated Top-Left Cyber Corner Bracket Asset (Non-Distorted 1:1) */}
      <svg
        className="pointer-events-none absolute top-1 left-1 w-3 h-3 transition-opacity duration-150 group-hover:opacity-100"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        style={{ opacity: disabled ? 0.25 : activeSelected ? 1 : 0.7 }}
      >
        <path
          d="M 1 9 L 1 1 L 9 1"
          stroke={cfg.cornerColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Dedicated Bottom-Right Cyber Corner Bracket Asset (Non-Distorted 1:1) */}
      <svg
        className="pointer-events-none absolute bottom-1 right-1 w-3 h-3 transition-opacity duration-150 group-hover:opacity-100"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        style={{ opacity: disabled ? 0.25 : activeSelected ? 1 : 0.7 }}
      >
        <path
          d="M 11 3 L 11 11 L 3 11"
          stroke={cfg.cornerColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Dedicated Top-Right Accent Node Asset (Non-Distorted 1:1 Circle) */}
      <svg
        className="pointer-events-none absolute top-1.5 right-1.5 w-1.5 h-1.5 transition-opacity duration-150 group-hover:opacity-100"
        viewBox="0 0 6 6"
        fill="none"
        aria-hidden="true"
        style={{ opacity: disabled ? 0.2 : activeSelected ? 1 : 0.6 }}
      >
        <circle cx="3" cy="3" r="1.5" fill={cfg.cornerColor} />
      </svg>

      {/* Dedicated Bottom-Left Accent Node Asset (Non-Distorted 1:1 Circle) */}
      <svg
        className="pointer-events-none absolute bottom-1.5 left-1.5 w-1.5 h-1.5 transition-opacity duration-150 group-hover:opacity-100"
        viewBox="0 0 6 6"
        fill="none"
        aria-hidden="true"
        style={{ opacity: disabled ? 0.2 : activeSelected ? 1 : 0.6 }}
      >
        <circle cx="3" cy="3" r="1.5" fill={cfg.cornerColor} />
      </svg>

      {/* Active/Pressed Deep Inset Shadow Overlay */}
      {isPressed && !disabled && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_4px_16px_rgba(0,0,0,0.96)] bg-black/35"
          aria-hidden="true"
        />
      )}

      {/* Interactive Content Slot */}
      <span className="relative z-10 inline-flex items-center justify-center gap-1.5 leading-snug text-center whitespace-nowrap">
        {shouldShowLock && !iconOnly && (
          <VectorLockGlyph color={cfg.cornerColor} className="w-3.5 h-3.5 shrink-0" />
        )}
        {shouldShowLock && iconOnly ? (
          <VectorLockGlyph color={cfg.cornerColor} className="w-3.5 h-3.5 shrink-0" />
        ) : (
          children
        )}
        {badgeText && (
          <span className="ml-1 px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-white/10 border border-white/15 text-cyan-300 shrink-0">
            {badgeText}
          </span>
        )}
      </span>
    </button>
  );
});

export default VectorButton;
