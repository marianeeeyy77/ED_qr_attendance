import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import Gradient from '@/components/Gradient';
import { GRADIENTS } from '@/constants/colors';

type Variant = 'personnel' | 'student' | 'brand';

const COLORS_BY_VARIANT: Record<Variant, readonly [string, string]> = {
  personnel: GRADIENTS.personnel,
  student: GRADIENTS.student,
  brand: GRADIENTS.personnel,
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
 * Gradient action button (spec B2 brand gradients):
 *   personnel → indigo-500 → indigo-900
 *   student   → amber-400  → amber-500
 * Press lifts + brightens; disabled/busy shows a spinner and dims.
 */
export default function GradientButton({
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  fill: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
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
