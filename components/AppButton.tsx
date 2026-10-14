import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text } from 'react-native';

import AnimatedPressable from '@/components/AnimatedPressable';
import { COLORS } from '@/constants/colors';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme?: 'primary';
  onPress: () => void;
  disabled?: boolean;
};

export default function AppButton({
  title,
  icon,
  theme,
  onPress,
  disabled = false,
}: Props) {
  const primary = theme === 'primary';
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      glowColor={primary ? COLORS.primary : COLORS.accent}
      pressScale={primary ? 0.97 : 0.98}
      accessibilityLabel={title}
      style={[
        styles.buttonInner,
        primary ? styles.primaryFill : styles.secondaryFill,
        disabled && styles.disabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={primary ? COLORS.textOnPrimary : COLORS.primary}
        style={styles.icon}
      />
      <Text
        style={[
          styles.label,
          primary ? styles.primaryLabel : styles.secondaryLabel,
        ]}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  buttonInner: {
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
  icon: { paddingRight: 10 },
  label: { fontSize: 17, fontWeight: '600', color: COLORS.textPrimary },
  primaryLabel: { fontWeight: '700', color: COLORS.textOnPrimary },
  secondaryLabel: { color: COLORS.primary },
  disabled: { opacity: 0.55 },
});