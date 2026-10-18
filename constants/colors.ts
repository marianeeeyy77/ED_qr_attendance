import { THEME } from './theme';

/**
 * CampusQR Attend design tokens — Black & Pink theme.
 *
 * The whole app reads from COLORS / SLATE / GRADIENTS / DEPTH / GLASS.
 * Pink heroes + pink CTAs, black sheets/headers, white surfaces.
 * All fonts high-contrast: dark on light, white on black.
 */

export const COLORS = {
  // ---- Brand / Accents (black + pink) ----------------------------------
  primary: THEME.primary, // Pink — brand, CTA buttons, active tabs, links
  primaryDeep: THEME.primaryDeep, // Deeper pink for pressed states
  primaryLight: THEME.primaryLight, // Light pink for hover/gradients

  /** Light pink — secondary accent, badges, chips, progress. */
  accent: THEME.accent,
  accentDeep: THEME.accentDeep, // Deep pink for accent borders
  blue: THEME.accent, // gradient partner / info glow
  /** Near-black — nav bars, dark panels, header bar. */
  ink: THEME.ink,
  /** Soft pink hero fill. */
  hero: THEME.hero,

  // ---- Surfaces (Soft Ice Blue Theme) ------------------------------
  /** Transparent — the ice-blue field lives in <AppBackground>. */
  background: 'transparent',
  /** Base fill using Soft Ice Blue. */
  bgBase: THEME.background,
  /** Card surface (translucent white) — primary card fill. */
  card: THEME.card,
  /** Softer surface for subtle containers. */
  surface: 'rgba(255, 255, 255, 0.7)',
  /** Solid Deep Royal Blue — nav bars, dark panels, header bar. */
  dark: THEME.primary,
  /** Opaque overlay for modals + dropdown menus. */
  modal: THEME.modal,
  /** Scrim dimming content behind open modal/menu. */
  scrim: THEME.scrim,
  /** Elevated surface for forms/tables/modals. */
  frosted: THEME.frosted,

  // ---- Text -----------------------------------------------------------
  textPrimary: THEME.headingText, // Near-black — primary text on light
  textSecondary: THEME.bodyText, // Dark gray — secondary text on light
  textOnPrimary: '#FFFFFF', // White text on pink CTA buttons (readable)
  textOnLight: THEME.headingText,
  /** White — headings on black sheets. */
  textOnDark: THEME.headingOnDark,
  /** Light gray — body on black sheets (readable). */
  textMutedOnDark: THEME.bodyOnDark,

  // ---- Lines / depth --------------------------------------------------
  border: THEME.border, // Tinted hairline border
  borderSoft: THEME.borderSoft,
  borderDark: 'rgba(255, 255, 255, 0.16)',
  shadow: THEME.shadow,

  // ---- Status ---------------------------------------------------------
  success: '#0E9F6E', // emerald — success / present / open
  warning: '#D97706', // amber-600 — late / warning
  danger: '#DC2626', // red-600 — errors / destructive / absent
  info: THEME.accent, // electric blue — info toasts
  neutral: '#8A93A6', // muted slate — closed / draft / neutral
  sky: THEME.accent, // excused — electric blue

  // ---- Toast solid backgrounds (600 shades for contrast) --------------
  toastSuccess: '#0E9F6E',
  toastError: '#DC2626',
  toastInfo: THEME.primary,
  toastWarning: '#D97706',

  /** QR dark modules — QR always renders dark-on-white. */
  qrInk: '#0f172a',
} as const;

/**
 * Black & Pink theme.
 * Cards use white surfaces with neutral hairline borders; nav/header use black.
 */
export const SLATE = {
  base: THEME.primary,
  card: THEME.card,
  cardSolid: THEME.surface,
  landingCard: 'rgba(255, 255, 255, 0.96)',
  tabBar: THEME.tabBar,
  border: THEME.border,
  indigo: THEME.primary,
  indigoLight: THEME.primaryLight,
  cyan: THEME.accent,
  emerald: '#0E9F6E',
  emeraldLight: '#34D399',
  amber: '#D97706',
  rose: '#DC2626',
  muted: THEME.bodyText,
} as const;

/** Brand gradients (pink hero + pink CTAs + black fills). */
export const GRADIENTS = {
  /** Global background stops (soft pink). */
  background: THEME.bgStops,
  /** Logo / app mark (pink → deep pink). */
  brand: [THEME.primary, THEME.primaryDeep, THEME.accent] as const,
  /** Personnel buttons (pink family). */
  personnel: [THEME.primary, THEME.primaryDeep] as const,
  /** Student buttons (pink family). */
  student: [THEME.accent, THEME.primary] as const,
  /** Header band (pink hero → deeper pink). Styling-only. */
  header: [THEME.hero, THEME.heroDeep, THEME.primary] as const,
  /** Soft-glass primary pill (pink). Styling-only. */
  primary: [THEME.primary, THEME.primaryDeep] as const,
} as const;

/** The exact CSS radial gradient used on web (soft pink). */
export const WEB_BACKGROUND_CSS = 'radial-gradient(ellipse 80% 60% at 50% 30%, #FFFFFF 0%, #FBF1F5 45%, #F6DCE7 75%, #F2C6D8 100%)';

/** Glassmorphism recipes (white glass, neutral hairlines). */
export const GLASS = {
  card: {
    overlay: 'rgba(255, 255, 255, 0.92)',
    border: THEME.border,
    intensity: 40,
    radius: 16,
  },
  soft: {
    overlay: 'rgba(255, 255, 255, 0.75)',
    border: THEME.borderSoft,
    intensity: 30,
    radius: 16,
  },
  dark: {
    overlay: 'rgba(0, 0, 0, 0.94)',
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
  innerBottom: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.08)'] as const,
  /** Beveled edge: lighter top hairline than the sides. */
  bevelTop: 'rgba(255,255,255,0.55)',

  /** Background aurora glows (soft pink). */
  auroraBlue: ['rgba(232,93,138,0.16)', 'rgba(232,93,138,0)'] as const,
  auroraIndigo: ['rgba(194,67,111,0.10)', 'rgba(194,67,111,0)'] as const,
  /** Grounding glow toward the bottom (soft pink). */
  auroraFloor: ['rgba(232,93,138,0.12)', 'rgba(232,93,138,0)'] as const,
  /** Edge vignette to focus the center (neutral shadow). */
  vignette: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.10)'] as const,

  /** Button glow shadows — tinted to the accent, not pure black. */
  glowPersonnel: THEME.primary,
  glowStudent: THEME.accent,
} as const;

/**
 * Soft Glass / Neumorphic tokens (styling-only): ultra-soft cool-grey
 * field with smooth extruded surfaces. RN renders one shadow set per
 * View, so the "dual" look = dark soft shadow + a 1px light top hairline
 * (see usage comments). No logic reads these — presentation only.
 */
export const NEUMO = {
  background: THEME.background,
  surface: THEME.surface,
  darkShadow: THEME.neumorphicShadow,
  lightShadow: '#FFFFFF',
  title: THEME.headingText,
  inputRadius: 20,
  cardRadius: 20,
  pillRadius: 999,
  extrudeOffset: { width: 3, height: 3 },
  extrudeOpacity: 0.15,
  extrudeRadius: 8,
  extrudeElevation: 4,
  highlight: 'rgba(255, 255, 255, 0.7)',
} as const;

/**
 * Fintech white-sheet tokens (styling-only): clean white container sheets
 * with soft drop shadows that tuck under the gradient header curve.
 * Rounded 32pt top corners (spec). No logic reads these — presentation only.
 */
export const SHEET = {
  background: THEME.surface,
  radius: 32,
  overlap: -12,
  padding: 16,
  shadowColor: THEME.primaryDeep,
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.1,
  shadowRadius: 16,
  elevation: 8,
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
