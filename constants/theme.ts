import type { TextStyle, ViewStyle } from 'react-native';

/**
 * CampusQR Attend — Modern Blue design tokens (presentation layer only).
 *
 * Single source of truth for the app palette. `constants/colors.ts` derives
 * its COLORS / SLATE / GRADIENTS / GLASS / DEPTH / NEUMO / SHEET tokens from
 * these values, so the whole app (Student, Teacher, Admin views) picks up the
 * theme in one place. No logic, routing, queries or state reads from here —
 * styling only.
 *
 * Palette (spec):
 *   Deep Royal Blue  #1E40AF  → primary headers, active tabs, CTA buttons
 *   Electric Blue    #3B82F6  → interactive accents, links, secondary accents
 *   Soft Ice Blue    #F0F5FA  → main background field
 *   White            #FFFFFF  → surface containers / cards / inputs
 *   Dark Slate       #0F172A  → heading text
 *   Cool Slate       #334155  → body / secondary text
 *
 * Event status pills stay soft pastel (spec):
 *   OPEN   #D1FAE5 (green)   CLOSED #FEE2E2 (red)   DRAFT #E0F2FE (blue)
 */
export const THEME = {
  // ---- Brand / Accents ------------------------------------------------
  /** Deep royal blue — primary headers, active tabs, CTAs. */
  primary: '#1E40AF',
  /** Deeper shade for pressed states / dark gradients. */
  primaryDeep: '#1E3A8A',
  /** Lighter royal blue for hover/gradients (spec: electric blue). */
  primaryLight: '#3B82F6',
  /** Electric blue — secondary accent, chips, progress, links. */
  accent: '#3B82F6',
  /** Deeper electric blue for accent borders. */
  accentDeep: '#2563EB',

  // ---- Surfaces -------------------------------------------------------
  /** Soft ice blue — main app background field. */
  background: '#F0F5FA',
  /** Solid white — surface containers, cards, inputs. */
  surface: '#FFFFFF',
  /** Translucent white card fill (glass sheets). */
  card: 'rgba(255, 255, 255, 0.92)',
  /** Tab bar fill. */
  tabBar: 'rgba(255, 255, 255, 0.98)',
  /** Opaque overlay for modals + dropdown menus. */
  modal: '#FFFFFF',
  /** Elevated frosted surface for forms/tables/modals. */
  frosted: 'rgba(255, 255, 255, 0.96)',
  /** Scrim dimming content behind open modal/menu. */
  scrim: 'rgba(30, 64, 175, 0.35)',

  // ---- Text -----------------------------------------------------------
  /** Dark slate — headings and titles. */
  headingText: '#0F172A',
  /** Cool slate — body / secondary text. */
  bodyText: '#334155',
  /** Spec alias — heading text. */
  textHeading: '#0F172A',
  /** Spec alias — body text. */
  textBody: '#334155',

  // ---- Lines / depth --------------------------------------------------
  /** Blue-tinted hairline border. */
  border: 'rgba(30, 64, 175, 0.16)',
  /** Softer hairline. */
  borderSoft: 'rgba(30, 64, 175, 0.10)',
  /** Neutral shadow tint. */
  shadow: '#0F172A',
  /** Cool grey-blue shadow used by the soft-extrude surfaces. */
  neumorphicShadow: '#C3D2E3',

  // ---- Background gradient stops (soft ice blue) ----------------------
  bgStops: ['#F7FAFD', '#F0F5FA', '#E3EDF7', '#D6E4F4'],

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
