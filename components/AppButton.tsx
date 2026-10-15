import { memo } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text } from 'react-native';

import AnimatedPressable from '@/components/AnimatedPressable';
import Gradient from '@/components/Gradient';
import { COLORS, DEPTH, GRADIENTS } from '@/constants/colors';

type Props = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme?: 'primary';
  onPress: () => void;
  disabled?: boolean;
};

export default memo(function AppButton({
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
      {primary ? (
        <>
          {/* Vibrant gradient surface + specular sheen (styling-only). */}
          <Gradient
            colors={GRADIENTS.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientFill}
          />
          <Gradient
            colors={DEPTH.specularTop}
            locations={[0, 0.5]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.sheen}
          />
        </>
      ) : null}
      <Ionicons
        name={icon}
        size={22}
        color={primary ? '#FFFFFF' : COLORS.primary}
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
});

const styles = StyleSheet.create({
  buttonInner: {
    minHeight: 48,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 14,
    position: 'relative',
  },
  primaryFill: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primaryDeep,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  gradientFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 14,
  },
  sheen: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '55%',
    borderRadius: 14,
  },
  secondaryFill: {
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: COLORS.accentDeep,
    shadowColor: COLORS.accentDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  icon: { paddingRight: 10 },
  label: { fontSize: 17, fontWeight: '700', letterSpacing: 0.3, zIndex: 1 },
  primaryLabel: { fontWeight: '700', color: '#FFFFFF' },
  secondaryLabel: { color: COLORS.primary },
  disabled: { opacity: 0.55 },
});