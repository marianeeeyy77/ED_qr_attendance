import type { TextStyle, ViewStyle } from 'react-native';

/**
 * CampusQR Attend — Black & Pink design tokens (presentation only).
 *
 * Single source of truth. `constants/colors.ts` derives its tokens from
 * these values. Black headers/sheets, pink heroes/CTAs, white surfaces.
 * Body text is dark gray on light surfaces, white/light-gray on black —
 * always high contrast and readable. Status pills keep green/amber/red
 * so attendance states stay distinguishable.
 */
export const THEME = {
  // ---- Brand / Accents (black + pink) ----------------------------------
  /** Pink — primary CTAs, links, accents. */
  primary: '#E85D8A',
  /** Deeper pink for pressed states / dark gradients. */
  primaryDeep: '#C2436F',
  /** Light pink for hover/gradients. */
  primaryLight: '#F49AC1',
  /** Light pink — secondary accent, chips, progress. */
  accent: '#F49AC1',
  /** Deep pink for accent borders. */
  accentDeep: '#C2436F',

  // ---- Ink (black surfaces) -------------------------------------------
  /** Near-black — headers, sheets, dark panels. */
  ink: '#111111',
  /** Pure black — deepest fills. */
  inkDeep: '#000000',

  // ---- Hero pink ------------------------------------------------------
  /** Soft pink hero fill (landing/login/register top). */
  hero: '#F6A9C6',
  /** Slightly deeper pink for hero gradient end. */
  heroDeep: '#F191B8',

  // ---- Surfaces -------------------------------------------------------
  /** Light pink-gray — main app background field. */
  background: '#FBF1F5',
  /** Solid white — surface containers, cards, inputs. */
  surface: '#FFFFFF',
  /** Translucent white card fill (glass sheets). */
  card: 'rgba(255, 255, 255, 0.96)',
  /** Tab bar fill. */
  tabBar: '#FFFFFF',
  /** Opaque overlay for modals + dropdown menus. */
  modal: '#FFFFFF',
  /** Elevated frosted surface for forms/tables/modals. */
  frosted: '#FFFFFF',
  /** Scrim dimming content behind open modal/menu. */
  scrim: 'rgba(17, 17, 17, 0.45)',

  // ---- Text (high contrast) -------------------------------------------
  /** Near-black — headings and titles. */
  headingText: '#111111',
  /** Dark gray — body / secondary text (readable on white). */
  bodyText: '#3D3D3D',
  /** Spec alias — heading text. */
  textHeading: '#111111',
  /** Spec alias — body text. */
  textBody: '#3D3D3D',

  // ---- Lines / depth --------------------------------------------------
  /** Neutral hairline border. */
  border: 'rgba(0, 0, 0, 0.14)',
  /** Softer hairline. */
  borderSoft: 'rgba(0, 0, 0, 0.08)',
  /** Neutral shadow tint. */
  shadow: '#000000',
  /** Cool grey shadow used by the soft-extrude surfaces. */
  neumorphicShadow: '#D4D4D4',

  // ---- Background gradient stops (soft pink) --------------------------
  bgStops: ['#FFFFFF', '#FBF1F5', '#F6DCE7', '#F2C6D8'],

  // ---- Text on dark (black sheets — always white / light gray) ---------
  /** White — headings on black. */
  headingOnDark: '#FFFFFF',
  /** Light gray — body on black (readable, not dim). */
  bodyOnDark: '#EDEDED',

  // ---- Event status pills (soft pastel, spec) -------------------------
  status: {
    /** OPEN — soft pastel green pill. */
    openBg: '#D1FAE5',
    openFg: '#166534',
    /** CLOSED — soft pastel red pill. */
    closedBg: '#FEE2E2',
    closedFg: '#991B1B',
    /** DRAFT — soft pastel blue pill. */
    draftBg: '#E0F2FE',
    draftFg: '#075985',
  },
} as const;

export type Theme = typeof THEME;

/**
 * Strongly typed typography scale (styling-only). Sizes/weights for the
 * corporate fintech look — headings in dark slate, body in cool slate.
 */
export const TYPOGRAPHY = {
  /** Hero / splash display text. */
  display: { fontSize: 28, fontWeight: '800', letterSpacing: -0.4, color: THEME.textHeading },
  /** Screen H1 (e.g. "Welcome Back"). */
  h1: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3, color: THEME.textHeading },
  /** Section H2. */
  h2: { fontSize: 20, fontWeight: '700', color: THEME.textHeading },
  /** Card / sheet title. */
  title: { fontSize: 17, fontWeight: '700', color: THEME.textHeading },
  /** Primary body copy. */
  body: { fontSize: 15, fontWeight: '400', lineHeight: 21, color: THEME.textBody },
  /** Secondary / meta copy. */
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18, color: THEME.textBody },
  /** Form labels. */
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3, color: THEME.textHeading },
  /** Button text (always white on blue). */
  button: { fontSize: 15, fontWeight: '700', letterSpacing: 0.4, color: '#FFFFFF' },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof TYPOGRAPHY;

/**
 * Strongly typed shadow recipes (styling-only). Blue-tinted soft drop
 * shadows for the corporate fintech depth language.
 */
export const SHADOWS = {
  /** Barely-there lift for chips / small tiles. */
  soft: {
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  /** Event / content cards on the white sheet. */
  card: {
    shadowColor: THEME.primaryDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  /** Rounded white sheet overlays. */
  sheet: {
    shadowColor: THEME.primaryDeep,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
  /** Floating action elements (raised above the tab bar). */
  floating: {
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  /** Scan QR circular FAB. */
  fab: {
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 12,
  },
} as const satisfies Record<string, ViewStyle>;

export type ShadowVariant = keyof typeof SHADOWS;
