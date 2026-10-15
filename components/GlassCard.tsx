import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import Blur from '@/components/Blur';
import Gradient from '@/components/Gradient';
import { DEPTH, GLASS, type GlassVariant } from '@/constants/colors';

type Props = {
  children: React.ReactNode;
  /** Which glass recipe to use (`.glass`, `.glass-soft`, `.glass-dark`). */
  variant?: GlassVariant;
  style?: StyleProp<ViewStyle>;
  /** Extra corner radius override. */
  radius?: number;
};

/**
 * Frosted glass surface (spec B2) with a 3D lift: uses `expo-blur` BlurView
 * with a translucent overlay + hairline border, plus a specular top
 * highlight, inner bottom shading and a lighter beveled top edge so the
 * pane reads as raised glass rather than a flat panel. On web the BlurView
 * falls back gracefully but border/background stay identical.
 */
export default function GlassCard({
  children,
  variant = 'card',
  style,
  radius,
}: Props) {
  const config = GLASS[variant];
  const cornerRadius = radius ?? config.radius;

  return (
    <View
      style={[
        styles.wrapper,
        {
          borderRadius: cornerRadius,
          borderColor: config.border,
          // Lighter top hairline + hairline sides = raised beveled edge.
          borderTopColor: DEPTH.bevelTop,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Blur
        intensity={config.intensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: config.overlay }]}
      />
      {/* Specular highlight across the top — light hitting the glass edge. */}
      <Gradient
        colors={DEPTH.specularTop}
        locations={[0, 0.35]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Inner shading at the bottom — glass thickness. */}
      <Gradient
        colors={DEPTH.innerBottom}
        locations={[0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 8,
  },
  content: {
    padding: 16,
  },
});
