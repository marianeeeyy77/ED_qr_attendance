/**
 * CampusQR Attend design tokens — light "Bone" glassmorphic theme.
 *
 * The whole app (legacy + CampusQR screens) reads from COLORS / SLATE /
 * GRADIENTS / DEPTH / GLASS, so the warm Bone + Royal Navy + Powder Blue
 * language is applied in one place. Screens set `backgroundColor: COLORS.background`,
 * which is transparent — the shared <AppBackground> warm radial shows through.
 *
 * Palette (spec):
 *   Royal Navy  #162660  → primary headers, active tabs, CTA buttons
 *   Powder Blue #D0E6FD  → interactive states, badges, progress, secondary accents
 *   Bone        #F1E4D1  → main background / card surfaces
 *   Cream               → inputs, elevated cards, dropdowns, modals
 *   Tan / Beige         → borders, dividers, inactive controls
 */

export const COLORS = {
  // ---- Brand / Accents ------------------------------------------------
  primary: '#162660', // Royal Navy — brand, CTA buttons, active tabs, links
  primaryDeep: '#0E1B45', // deeper navy — gradient end / pressed states
  primaryLight: '#2A3F8F', // lighter navy — hover / gradient start
  /** Powder Blue — secondary accent, badges, chips, progress. */
  accent: '#D0E6FD',
  accentDeep: '#A9CCF7', // deeper powder blue — accent borders
  blue: '#3B82F6', // gradient partner / info glow

  // ---- Surfaces (light Bone theme) ------------------------------------
  /** Transparent — the warm radial lives in <AppBackground>. */
  background: 'transparent',
  /** Bone base fill behind the warm radial gradient. */
  bgBase: '#F1E4D1',
  /** Cream card surface (translucent) — primary card fill. */
  card: 'rgba(255, 253, 247, 0.88)',
  /** Softer cream surface for subtle containers. */
  surface: 'rgba(255, 253, 247, 0.7)',
  /** Navy solid — nav bars, dark panels, header bar. */
  dark: '#162660',
  /**
   * Opaque cream overlay for modals + dropdown menus (readable navy text,
   * no bleed-through from content behind the overlay).
   */
  modal: '#FFFBF2',
  /** Warm scrim dimming the content behind an open modal/menu. */
  scrim: 'rgba(22, 38, 96, 0.35)',
  /** Elevated cream surface for forms/tables/modals. */
  frosted: 'rgba(255, 253, 247, 0.94)',

  // ---- Text -----------------------------------------------------------
  textPrimary: '#162660', // navy — primary text on light surfaces
  textSecondary: '#4A5878', // deep slate-navy — secondary text on light (AA+ on cream)
  textOnPrimary: '#FFFFFF', // white — text on navy CTA buttons
  textOnLight: '#162660', // navy — text on light frosted panels

  // ---- Lines / depth --------------------------------------------------
  border: 'rgba(22, 38, 96, 0.18)', // tan-tinted hairline border
  borderSoft: 'rgba(22, 38, 96, 0.12)',
  borderDark: 'rgba(255, 255, 255, 0.16)',
  shadow: '#3A2C17', // warm brown-black shadow for depth

  // ---- Status (tuned for contrast on Bone) ----------------------------
  success: '#0E9F6E', // emerald — success / present / open
  warning: '#D97706', // amber-600 — late / warning
  danger: '#DC2626', // red-600 — errors / destructive / absent
  info: '#2A5BD7', // royal blue — info toasts
  neutral: '#8A93A6', // muted slate — closed / draft / neutral
  sky: '#2A5BD7', // excused — royal blue

  // ---- Toast solid backgrounds (600 shades for contrast) --------------
  toastSuccess: '#0E9F6E',
  toastError: '#DC2626',
  toastInfo: '#162660',
  toastWarning: '#D97706',

  /** QR dark modules — QR always renders dark-on-white. */
  qrInk: '#0f172a',
} as const;

/**
 * Light "Bone" glassmorphic theme (new visual language).
 * Cards use cream glass with tan hairline borders; nav/header use Royal Navy.
 */
export const SLATE = {
  base: '#162660',
  card: 'rgba(255, 253, 247, 0.88)',
  cardSolid: '#FFFBF2',
  landingCard: 'rgba(255, 253, 247, 0.92)',
  tabBar: 'rgba(241, 228, 209, 0.96)',
  border: 'rgba(22, 38, 96, 0.18)',
  indigo: '#162660',
  indigoLight: '#2A3F8F',
  cyan: '#3B82F6',
  emerald: '#0E9F6E',
  emeraldLight: '#34D399',
  amber: '#D97706',
  rose: '#DC2626',
  muted: '#4A5878',
} as const;

/** Brand gradients (warm Bone + Navy). */
export const GRADIENTS = {
  /** Global warm radial background stops (lightest near 50% 30%). */
  background: ['#FBF1DE', '#F1E4D1', '#E7D6B8', '#DCC7A0'] as const,
  /** Logo / app mark (Navy → Powder Blue). */
  brand: ['#162660', '#2A3F8F', '#7FA8E0'] as const,
  /** Personnel (teacher/admin) buttons (deep navy). */
  personnel: ['#1E3A8A', '#162660'] as const,
  /** Student buttons (royal blue family, on-palette). */
  student: ['#2A5BD7', '#162660'] as const,
} as const;

/** The exact CSS radial gradient used on web (warm Bone). */
export const WEB_BACKGROUND_CSS =
  'radial-gradient(ellipse 80% 60% at 50% 30%, #FBF1DE 0%, #F1E4D1 45%, #E7D6B8 75%, #DCC7A0 100%)';

/** Glassmorphism recipes (cream glass on Bone, tan hairlines). */
export const GLASS = {
  card: {
    overlay: 'rgba(255, 253, 247, 0.85)',
    border: 'rgba(22, 38, 96, 0.18)',
    intensity: 40,
    radius: 16,
  },
  soft: {
    overlay: 'rgba(255, 253, 247, 0.65)',
    border: 'rgba(22, 38, 96, 0.14)',
    intensity: 30,
    radius: 16,
  },
  dark: {
    overlay: 'rgba(22, 38, 96, 0.92)',
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
  innerBottom: ['rgba(58,44,23,0)', 'rgba(58,44,23,0.10)'] as const,
  /** Beveled edge: lighter top hairline than the sides. */
  bevelTop: 'rgba(255,255,255,0.55)',

  /** Background aurora glows (powder blue + warm tan, from the palette). */
  auroraBlue: ['rgba(208,230,253,0.55)', 'rgba(208,230,253,0)'] as const,
  auroraIndigo: ['rgba(22,38,96,0.10)', 'rgba(22,38,96,0)'] as const,
  /** Grounding glow toward the bottom (warm tan). */
  auroraFloor: ['rgba(227,205,168,0.45)', 'rgba(227,205,168,0)'] as const,
  /** Edge vignette to focus the center (warm shadow). */
  vignette: ['rgba(120,100,70,0)', 'rgba(120,100,70,0.14)'] as const,

  /** Button glow shadows — tinted to the accent, not pure black. */
  glowPersonnel: '#162660',
  glowStudent: '#2A5BD7',
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
