/**
 * CampusQR Attend design tokens — light "Light Grey" glassmorphic theme.
 *
 * The whole app (legacy + CampusQR screens) reads from COLORS / SLATE /
 * GRADIENTS / DEPTH / GLASS, so the Royal Blue + Sky Blue + Light Grey
 * language is applied in one place. Screens set `backgroundColor: COLORS.background`,
 * which is transparent — the shared <AppBackground> grey radial shows through.
 *
 * Palette (spec):
 *   Royal Blue  #10367D  → primary headers, active tabs, CTA buttons, text
 *   Sky Blue    #74B4D9  → interactive states, badges, progress, secondary accents
 *   Light Grey  #EBEBEB  → main background / card surfaces
 *   Navy-tint            → borders, dividers, inactive controls
 */

export const COLORS = {
  // ---- Brand / Accents ------------------------------------------------
  primary: '#10367D', // Royal Blue — brand, CTA buttons, active tabs, links
  primaryDeep: '#0A2556', // Deeper shade for pressed states
  primaryLight: '#204C9E', // Lighter royal blue for hover/gradients

  /** Sky Blue — secondary accent, badges, chips, progress. */
  accent: '#74B4D9',
  accentDeep: '#5098C3', // Deeper sky blue for accent borders
  blue: '#74B4D9', // gradient partner / info glow

  // ---- Surfaces (Light Grey Theme) ------------------------------
  /** Transparent — the grey radial lives in <AppBackground>. */
  background: 'transparent',
  /** Base fill using Light Grey. */
  bgBase: '#EBEBEB',
  /** Card surface (translucent) — primary card fill. */
  card: 'rgba(235, 235, 235, 0.88)',
  /** Softer surface for subtle containers. */
  surface: 'rgba(235, 235, 235, 0.7)',
  /** Solid Royal Blue — nav bars, dark panels, header bar. */
  dark: '#10367D',
  /** Opaque overlay for modals + dropdown menus. */
  modal: '#F4F4F4',
  /** Scrim dimming content behind open modal/menu. */
  scrim: 'rgba(16, 54, 125, 0.35)',
  /** Elevated surface for forms/tables/modals. */
  frosted: 'rgba(235, 235, 235, 0.94)',

  // ---- Text -----------------------------------------------------------
  textPrimary: '#10367D', // Royal blue — primary text
  textSecondary: '#4A5878', // Deep slate-navy for secondary text
  textOnPrimary: '#FFFFFF', // White text on royal blue CTA buttons
  textOnLight: '#10367D', // Royal blue text on light panels

  // ---- Lines / depth --------------------------------------------------
  border: 'rgba(16, 54, 125, 0.18)', // Tinted hairline border
  borderSoft: 'rgba(16, 54, 125, 0.12)',
  borderDark: 'rgba(255, 255, 255, 0.16)',
  shadow: '#1A2338',

  // ---- Status ---------------------------------------------------------
  success: '#0E9F6E', // emerald — success / present / open
  warning: '#D97706', // amber-600 — late / warning
  danger: '#DC2626', // red-600 — errors / destructive / absent
  info: '#74B4D9', // sky blue — info toasts
  neutral: '#8A93A6', // muted slate — closed / draft / neutral
  sky: '#74B4D9', // excused — sky blue

  // ---- Toast solid backgrounds (600 shades for contrast) --------------
  toastSuccess: '#0E9F6E',
  toastError: '#DC2626',
  toastInfo: '#10367D',
  toastWarning: '#D97706',

  /** QR dark modules — QR always renders dark-on-white. */
  qrInk: '#0f172a',
} as const;

/**
 * Light "Light Grey" glassmorphic theme (new visual language).
 * Cards use light-grey glass with navy-tint hairline borders; nav/header use Royal Blue.
 */
export const SLATE = {
  base: '#10367D',
  card: 'rgba(235, 235, 235, 0.88)',
  cardSolid: '#F4F4F4',
  landingCard: 'rgba(235, 235, 235, 0.92)',
  tabBar: 'rgba(235, 235, 235, 0.96)',
  border: 'rgba(16, 54, 125, 0.18)',
  indigo: '#10367D',
  indigoLight: '#204C9E',
  cyan: '#74B4D9',
  emerald: '#0E9F6E',
  emeraldLight: '#34D399',
  amber: '#D97706',
  rose: '#DC2626',
  muted: '#4A5878',
} as const;

/** Brand gradients (Light Grey + Royal Blue + Sky Blue). */
export const GRADIENTS = {
  /** Global warm radial background stops (lightest near 50% 30%). */
  background: ['#F4F4F4', '#EBEBEB', '#E1E1E1', '#D6D6D6'] as const,
  /** Logo / app mark (Navy → Powder Blue). */
  brand: ['#10367D', '#204C9E', '#74B4D9'] as const,
  /** Personnel (teacher/admin) buttons (deep navy). */
  personnel: ['#10367D', '#0A2556'] as const,
  /** Student buttons (royal blue family, on-palette). */
  student: ['#5098C3', '#10367D'] as const,
} as const;

/** The exact CSS radial gradient used on web (Light Grey). */
export const WEB_BACKGROUND_CSS =
  'radial-gradient(ellipse 80% 60% at 50% 30%, #F4F4F4 0%, #EBEBEB 45%, #E1E1E1 75%, #D6D6D6 100%)';

/** Glassmorphism recipes (light-grey glass, navy-tint hairlines). */
export const GLASS = {
  card: {
    overlay: 'rgba(235, 235, 235, 0.85)',
    border: 'rgba(16, 54, 125, 0.18)',
    intensity: 40,
    radius: 16,
  },
  soft: {
    overlay: 'rgba(235, 235, 235, 0.65)',
    border: 'rgba(16, 54, 125, 0.14)',
    intensity: 30,
    radius: 16,
  },
  dark: {
    overlay: 'rgba(16, 54, 125, 0.92)',
    border: 'rgba(255, 255, 255, 0.16)',
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

/**
 * 3D depth layer (UI/UX polish). Built ONLY from white/black overlays and
 * the palette colors already defined above — no new hues, no token values
 * changed. Used by the background aurora, the glass specular/sheen, the
 * beveled edges and the button glow shadows to give the flat glassmorphism
 * a raised, floating-glass sense of depth.
 */
export const DEPTH = {
  /** Specular highlight on the top of a glass/button surface. */
  specularTop: ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)'] as const,
  /** Softer sheen for the header / smaller marks. */
  sheenSoft: ['rgba(255,255,255,0.40)', 'rgba(255,255,255,0)'] as const,
  /** Inner shading along the bottom of a glass pane (thickness). */
  innerBottom: ['rgba(16,54,125,0)', 'rgba(16,54,125,0.10)'] as const,
  /** Beveled edge: lighter top hairline than the sides. */
  bevelTop: 'rgba(255,255,255,0.55)',

  /** Background aurora glows (sky blue + royal blue, from the palette). */
  auroraBlue: ['rgba(116,180,217,0.55)', 'rgba(116,180,217,0)'] as const,
  auroraIndigo: ['rgba(16,54,125,0.10)', 'rgba(16,54,125,0)'] as const,
  /** Grounding glow toward the bottom (sky blue). */
  auroraFloor: ['rgba(116,180,217,0.40)', 'rgba(116,180,217,0)'] as const,
  /** Edge vignette to focus the center (navy shadow). */
  vignette: ['rgba(16,54,125,0)', 'rgba(16,54,125,0.14)'] as const,

  /** Button glow shadows — tinted to the accent, not pure black. */
  glowPersonnel: '#10367D',
  glowStudent: '#5098C3',
} as const;

/**
 * Shared spacing / radius / button-size tokens so every screen lays out its
 * buttons and cards with one rhythm (instead of ad-hoc 6/8/10pt gaps and
 * 44/48pt heights drifting per file).
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  /** Gap between sibling buttons inside an action row. */
  buttonGap: 8,
  /** Gap between list cards. */
  cardGap: 12,
  /** Top inset before a list that sits below a control bar (Create/filters). */
  listTop: 12,
} as const;

export const RADIUS = {
  button: 12,
  card: 16,
  pill: 999,
  /** Bottom-nav active button surface. */
  nav: 14,
} as const;

export const BTN = {
  /** Primary / full-width CTA touch height. */
  primary: 48,
  /** Secondary / inline action touch height. */
  secondary: 44,
} as const;
