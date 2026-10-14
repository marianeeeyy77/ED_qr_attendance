import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import AnimatedPressable from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/colors';

/**
 * Busy button with spinner label (spec: busy buttons with spinner label).
 * Wraps AnimatedPressable so the press/hover motion matches every other
 * interactive element; shows a spinner while `loading`.
 */
type Props = {
  title: string;
  loadingTitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  theme?: 'primary' | 'secondary';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function BusyButton({
  title,
  loadingTitle,
  icon,
  theme = 'primary',
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  const isDisabled = disabled || loading;
  const primary = theme === 'primary';

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      glowColor={primary ? COLORS.primary : COLORS.accent}
      pressScale={primary ? 0.97 : 0.98}
      accessibilityLabel={title}
      style={[
        styles.inner,
        primary ? styles.primaryFill : styles.secondaryFill,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={primary ? '#FFFFFF' : COLORS.primary}
          style={styles.icon}
        />
      ) : icon ? (
        <Ionicons
          name={icon}
          size={22}
          color={primary ? '#FFFFFF' : COLORS.primary}
          style={styles.icon}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          primary ? styles.primaryLabel : styles.secondaryLabel,
        ]}
      >
        {loading ? loadingTitle ?? 'Working...' : title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    minHeight: 48,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 14,
  },
  primaryFill: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primaryDeep,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  secondaryFill: {
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.accentDeep,
  },
  icon: {
    paddingRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryLabel: {
    color: COLORS.primary,
  },
  disabled: {
    opacity: 0.55,
  },
});
