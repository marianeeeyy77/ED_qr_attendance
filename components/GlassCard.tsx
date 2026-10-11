import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import Blur from '@/components/Blur';
import { GLASS, type GlassVariant } from '@/constants/colors';

type Props = {
  children: React.ReactNode;
  /** Which glass recipe to use (`.glass`, `.glass-soft`, `.glass-dark`). */
  variant?: GlassVariant;
  style?: StyleProp<ViewStyle>;
  /** Extra corner radius override. */
  radius?: number;
};

/**
 * Frosted glass surface (spec B2). Uses `expo-blur` BlurView with a
 * translucent overlay + hairline border so native and web match. On web
 * the BlurView falls back gracefully but border/background stay identical.
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
