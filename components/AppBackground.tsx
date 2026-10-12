import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, DEPTH, GRADIENTS, WEB_BACKGROUND_CSS } from '@/constants/colors';
import Gradient from '@/components/Gradient';

type Props = {
  children: React.ReactNode;
};

/**
 * Web keeps the spec's exact base radial, then layers two soft blue radial
 * glows on top for a sense of depth behind the floating glass cards.
 * (`backgroundImage` is web-only CSS that RN's ViewStyle type doesn't model.)
 */
const WEB_BG_STYLE = {
  ...StyleSheet.absoluteFillObject,
  backgroundImage: [
    // blue aurora, upper area
    'radial-gradient(60% 45% at 22% 12%, rgba(99,102,241,0.34) 0%, rgba(99,102,241,0) 70%)',
    // blue-500 secondary glow, lower-center
    'radial-gradient(70% 50% at 70% 88%, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0) 70%)',
    // base spec radial (last = bottom layer)
    WEB_BACKGROUND_CSS,
  ].join(', '),
} as unknown as StyleProp<ViewStyle>;

/**
 * Global 3D background (spec B2 + depth polish).
 *
 * Web uses the spec's exact CSS `radial-gradient` with two blue glows
 * layered on top. Native stacks: base fill → the 4 spec stops → an indigo
 * aurora (upper-left) → a blue-500 aurora (top-center) → a soft floor glow
 * (bottom) → an edge vignette. Together these frame the content as floating
 * frosted glass while staying strictly within the existing blue/indigo theme.
 */
export default function AppBackground({ children }: Props) {
  return (
    <View style={styles.root}>
      <View
        pointerEvents="none"
        style={Platform.OS === 'web' ? WEB_BG_STYLE : StyleSheet.absoluteFill}
      >
        {Platform.OS !== 'web' && (
          <>
            {/* Base fill = darkest radial stop. */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bgBase }]} />
            {/* The four spec stops, brightest at the top (≈ 50% 30%). */}
            <Gradient
              colors={GRADIENTS.background}
              locations={[0, 0.45, 0.75, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Soft indigo glow centered near the top (the ellipse core). */}
            <Gradient
              colors={['rgba(99,102,241,0.45)', 'rgba(99,102,241,0)']}
              start={{ x: 0.5, y: 0.02 }}
              end={{ x: 0.5, y: 0.6 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Indigo aurora, upper-left — a second, off-center light source. */}
            <Gradient
              colors={DEPTH.auroraIndigo}
              start={{ x: 0.05, y: 0.05 }}
              end={{ x: 0.55, y: 0.55 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Blue-500 aurora across the top for the primary blue lift. */}
            <Gradient
              colors={DEPTH.auroraBlue}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 0.62 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Soft blue floor glow toward the bottom to ground the scene. */}
            <Gradient
              colors={DEPTH.auroraFloor}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0.62 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Edge vignette focuses the center; uses the darkest stop. */}
            <Gradient
              colors={DEPTH.vignette}
              locations={[0.55, 1]}
              start={{ x: 0.5, y: 0.5 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          </>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bgBase,
  },
  content: {
    flex: 1,
  },
});
