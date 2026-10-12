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
    // powder-blue aurora, upper area
    'radial-gradient(60% 45% at 22% 12%, rgba(208,230,253,0.55) 0%, rgba(208,230,253,0) 70%)',
    // warm tan glow, lower-center
    'radial-gradient(70% 50% at 70% 88%, rgba(227,205,168,0.45) 0%, rgba(227,205,168,0) 70%)',
    // base spec radial (last = bottom layer)
    WEB_BACKGROUND_CSS,
  ].join(', '),
} as unknown as StyleProp<ViewStyle>;

/**
 * Global 3D background (warm Bone theme + depth polish).
 *
 * Web uses the spec's exact CSS `radial-gradient` with a powder-blue glow
 * and a warm tan glow layered on top. Native stacks: base fill → the 4 warm
 * stops → a powder-blue aurora (upper-left) → a soft tan floor glow (bottom)
 * → an edge vignette. Together these frame the content as floating cream
 * glass while staying strictly within the Bone/Navy/Powder-Blue theme.
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
            {/* Base fill = lightest warm stop. */}
            <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.bgBase }]} />
            {/* The four warm stops, lightest at the top (≈ 50% 30%). */}
            <Gradient
              colors={GRADIENTS.background}
              locations={[0, 0.45, 0.75, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Powder-blue glow centered near the top (the ellipse core). */}
            <Gradient
              colors={['rgba(208,230,253,0.55)', 'rgba(208,230,253,0)']}
              start={{ x: 0.5, y: 0.02 }}
              end={{ x: 0.5, y: 0.6 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Powder-blue aurora, upper-left — a second, off-center light source. */}
            <Gradient
              colors={DEPTH.auroraBlue}
              start={{ x: 0.05, y: 0.05 }}
              end={{ x: 0.55, y: 0.55 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Soft warm tan floor glow toward the bottom to ground the scene. */}
            <Gradient
              colors={DEPTH.auroraFloor}
              start={{ x: 0.5, y: 1 }}
              end={{ x: 0.5, y: 0.62 }}
              style={StyleSheet.absoluteFill}
            />
            {/* Edge vignette focuses the center; warm shadow tone. */}
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
