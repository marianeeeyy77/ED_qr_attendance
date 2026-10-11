import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { COLORS, GRADIENTS, WEB_BACKGROUND_CSS } from '@/constants/colors';
import Gradient from '@/components/Gradient';

type Props = {
  children: React.ReactNode;
};

/**
 * `backgroundImage` is a web-only CSS property that React Native's
 * ViewStyle type does not model, so we cast this one style literal.
 */
const WEB_BG_STYLE = {
  ...StyleSheet.absoluteFillObject,
  backgroundImage: WEB_BACKGROUND_CSS,
} as unknown as StyleProp<ViewStyle>;

/**
 * Global dark radial background (spec B2).
 *
 * Web uses the exact CSS `radial-gradient` from the spec. Native stacks a
 * base fill + the 4 spec stops + a soft indigo glow to approximate the
 * "ellipse 80% 60% at 50% 30%" look, all behind the content.
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
            {/* Blue-500 secondary glow for depth. */}
            <Gradient
              colors={['rgba(59,130,246,0.22)', 'rgba(59,130,246,0)']}
              start={{ x: 0.5, y: 0.1 }}
              end={{ x: 0.5, y: 0.7 }}
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
