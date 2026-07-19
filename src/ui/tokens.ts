// ─── Design System Tokens ─────────────────────────────────────────────────────
// Single source of truth. Never hardcode values outside this file.

export const colors = {
  // ── Neutral palette ──────────────────────────────────────────────────────
  paper:    '#F7F5F1',  // background
  ink:      '#17151F',  // primary text
  muted:    '#8A8477',  // secondary text / labels
  line:     '#E8E4DD',  // dividers, borders
  surface:  '#EDEAE5',  // card surfaces on paper

  // ── Accent ───────────────────────────────────────────────────────────────
  accent:   '#6B4FBB',  // violet — primary CTA
  accentDim:'#9B80E8',  // lighter variant for icons / inactive states
  accentBg: '#EDE8F8',  // accent tint background

  // ── Hero / Aurora gradients ───────────────────────────────────────────────
  heroTop:  '#0F0C1A',  // very dark purple-black
  heroMid:  '#1A1035',  // deep aurora
  heroOrb1: '#3D1F80',  // violet orb
  heroOrb2: '#1E3A5F',  // blue orb
  heroOrb3: '#2D1048',  // deep purple orb

  // ── Semantic ─────────────────────────────────────────────────────────────
  success:  '#3DAA6A',
  warning:  '#D97706',
  danger:   '#DC2626',
  dangerBg: '#FEE2E2',

  // ── Text on hero (light) ─────────────────────────────────────────────────
  heroText:  '#F0EDF8',
  heroMuted: '#9B93B8',

  // ── Overlay / glass ──────────────────────────────────────────────────────
  glassLight: 'rgba(247,245,241,0.12)',
  glassDark:  'rgba(15,12,26,0.6)',
  overlay:    'rgba(23,21,31,0.4)',

  // ── Transparent ──────────────────────────────────────────────────────────
  transparent: 'transparent',
} as const;

export const typography = {
  // Loaded via expo-font
  serifFamily:  'InstrumentSerif-Regular',
  serifItalic:  'InstrumentSerif-Italic',
  sansFamily:   'InstrumentSans-Regular',
  sansMedium:   'InstrumentSans-Medium',
  sansSemiBold: 'InstrumentSans-SemiBold',
  sansBold:     'InstrumentSans-Bold',

  // Fallbacks (system fonts)
  serifFallback: 'Georgia',
  sansFallback:  'System',

  // Scale
  size: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    '2xl': 32,
    '3xl': 44,
    '4xl': 56,
    hero: 72,
  },

  // Line heights
  leading: {
    tight:  1.1,
    snug:   1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  '0':   0,
  '1':   4,
  '2':   8,
  '3':   12,
  '4':   16,
  '5':   20,
  '6':   24,
  '7':   28,
  '8':   32,
  '10':  40,
  '12':  48,
  '16':  64,
  '20':  80,
} as const;

export const radii = {
  sm:   8,
  md:   14,
  lg:   20,
  xl:   28,  // primary card radius
  '2xl': 36,
  full: 9999,
} as const;

export const shadows = {
  // iOS-style soft shadows
  sm: {
    shadowColor: '#17151F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#17151F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#17151F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  // Hero card shadow (on dark background)
  hero: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export const animation = {
  // Duration in ms
  fast:   150,
  normal: 280,
  slow:   500,
  // Count-up
  countUp: 800,
  // Draw-on-mount (charts)
  draw: 600,
  // Spring preset for button press / checkmark
  spring: {
    damping: 15,
    stiffness: 200,
    mass: 0.8,
  },
  // Sheet transition
  sheet: {
    duration: 320,
    // cubic-bezier(0.32, 0.72, 0.33, 1)
  },
} as const;

export const hitSlop = {
  // Minimum 44x44px touch target (per Apple HIG / WCAG)
  default: { top: 8, bottom: 8, left: 8, right: 8 },
  sm: { top: 4, bottom: 4, left: 4, right: 4 },
} as const;

/** Convenience: returns style object to make an element ≥44px tap target */
export const minTouchTarget = {
  minWidth: 44,
  minHeight: 44,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};
