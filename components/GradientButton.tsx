import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import Gradient from '@/components/Gradient';
import { DEPTH, GRADIENTS, NEUMO } from '@/constants/colors';

type Variant = 'personnel' | 'student' | 'brand';

const COLORS_BY_VARIANT: Record<Variant, readonly [string, string]> = {
  personnel: GRADIENTS.primary,
  student: GRADIENTS.primary,
  brand: GRADIENTS.primary,
};

/** Soft black glow-shadow for the mono pill (styling-only). */
const GLOW_BY_VARIANT: Record<Variant, string> = {
  personnel: '#000000',
  student: '#000000',
  brand: '#000000',
};

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

/**
 * Mono pill button (styling-only): black → gray gradient,
 * fully rounded, soft drop shadow. Variants converge on one primary.
 */
export default memo(function GradientButton({
  title,
  onPress,
  variant = 'personnel',
  disabled = false,
  loading = false,
  style,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.wrap,
        { shadowColor: GLOW_BY_VARIANT[variant] },
        style,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <Gradient
        colors={COLORS_BY_VARIANT[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fill}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" style={styles.icon} />
        ) : null}
        <Text style={styles.label}>{title}</Text>
      </Gradient>
      {/* Specular highlight across the top of the pill (raised edge). */}
      <Gradient
        colors={DEPTH.specularTop}
        locations={[0, 0.5]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.sheen}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  wrap: {
    borderRadius: NEUMO.pillRadius,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  fill: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  sheen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '50%',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.55,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
