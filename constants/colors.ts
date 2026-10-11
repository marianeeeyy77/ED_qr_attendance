/**
 * CampusQR Attend design tokens (spec section B2 — EXACT palette).
 *
 * The whole app (legacy + CampusQR screens) reads from COLORS, so the dark
 * indigo / glassmorphism language is applied in one place. Screens set
 * `backgroundColor: COLORS.background`, which is transparent — the shared
 * <AppBackground> radial gradient shows through behind every screen.
 */
export const COLORS = {
  // ---- Accents --------------------------------------------------------
  primary: '#6366f1', // indigo-500 — brand, personnel buttons, links
  primaryDeep: '#312e81', // indigo-900 — deep gradient end
  blue: '#3b82f6', // blue-500 — gradient partner, glow
  amber: '#fbbf24', // amber-400 — student accent
  amberDeep: '#f59e0b', // amber-500 — student accent end / warnings
  teal: '#14b8a6', // status badge "open"
  sky: '#0ea5e9', // status badge "excused"

  // ---- Surfaces -------------------------------------------------------
  /** Transparent — the radial gradient lives in <AppBackground>. */
  background: 'transparent',
  /** Darkest radial stop / base fill behind the gradient. */
  bgBase: '#070724',
  /** .glass — cards */
  card: 'rgba(255,255,255,0.10)',
  /** .glass-soft — subtle surfaces */
  surface: 'rgba(255,255,255,0.08)',
  /** .glass-dark — nav bars, dark panels */
  dark: 'rgba(15,15,60,0.55)',
  /** Light frosted surface for forms/tables/modals (dark text on it). */
  frosted: 'rgba(255,255,255,0.88)',

  // ---- Text -----------------------------------------------------------
  textPrimary: '#ffffff', // white on dark glass
  textSecondary: '#a5b4fc', // indigo-200 — secondary text on dark
  textOnPrimary: '#ffffff',
  textOnLight: '#1e293b', // slate-800 — text on light frosted panels

  // ---- Lines / depth --------------------------------------------------
  border: 'rgba(255,255,255,0.22)',
  borderSoft: 'rgba(255,255,255,0.20)',
  borderDark: 'rgba(255,255,255,0.18)',
  shadow: '#000000',

  // ---- Status ---------------------------------------------------------
  success: '#10b981', // emerald — success / present / open
  warning: '#f59e0b', // amber — late / warning
  danger: '#f43f5e', // rose — errors / destructive / absent
  info: '#6366f1', // indigo — info toasts
  neutral: '#94a3b8', // slate — closed / draft / neutral

  /** QR dark modules (slate-900) — QR always renders dark-on-white. */
  qrInk: '#0f172a',
} as const;

/** Brand gradients (spec B2). */
export const GRADIENTS = {
  /** Global radial background 4 stops (brightest near 50% 30%). */
  background: ['#2b2a8f', '#1a1865', '#0d0c3d', '#070724'] as const,
  /** Logo / app mark. */
  brand: ['#6366f1', '#3b82f6', '#f59e0b'] as const,
  /** Personnel (teacher/admin) buttons. */
  personnel: ['#6366f1', '#312e81'] as const,
  /** Student buttons. */
  student: ['#fbbf24', '#f59e0b'] as const,
} as const;

/** The exact CSS radial gradient used on web (spec B2). */
export const WEB_BACKGROUND_CSS =
  'radial-gradient(ellipse 80% 60% at 50% 30%, #2b2a8f 0%, #1a1865 45%, #0d0c3d 75%, #070724 100%)';

/** Glassmorphism recipes (spec B2 `.glass` / `.glass-soft` / `.glass-dark`). */
export const GLASS = {
  card: {
    overlay: 'rgba(255,255,255,0.10)',
    border: 'rgba(255,255,255,0.22)',
    intensity: 34,
    radius: 16,
  },
  soft: {
    overlay: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.20)',
    intensity: 26,
    radius: 16,
  },
  dark: {
    overlay: 'rgba(15,15,60,0.55)',
    border: 'rgba(255,255,255,0.18)',
    intensity: 34,
    radius: 16,
  },
} as const;

export type GlassVariant = keyof typeof GLASS;

/** Returns `#rrggbb` with the given alpha (0..1) as an rgba() string. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
