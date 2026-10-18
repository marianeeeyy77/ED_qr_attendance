import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AnimatedPressable from '@/components/AnimatedPressable';
import { COLORS, NEUMO } from '@/constants/colors';

export type DropdownOption = { label: string; value: string };

type Props = {
  label?: string;
  value: string;
  placeholder?: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

/**
 * Simple modal dropdown built from core RN primitives (no new
 * dependencies). Touch targets are at least 44dp. The trigger and each
 * option use AnimatedPressable for the shared press/hover motion; the
 * sheet slides up.
 */
export default function Dropdown({
  label,
  value,
  placeholder = 'Select...',
  options,
  onChange,
  disabled = false,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const display = selected ? selected.label : placeholder;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <AnimatedPressable
        style={[styles.field, disabled && styles.disabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        glowColor={COLORS.accent}
        accessibilityLabel={label ?? placeholder}
      >
        <Text
          style={[styles.value, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {display}
        </Text>
        <Ionicons
          name="chevron-down"
          size={18}
          color={COLORS.textSecondary}
        />
      </AnimatedPressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label ?? placeholder}</Text>
            <ScrollView style={styles.list} bounces={false}>
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <AnimatedPressable
                    key={option.value || '__placeholder'}
                    style={[styles.option, active && styles.optionActive]}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    glowColor={COLORS.accent}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        active && styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {active ? (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={COLORS.primary}
                      />
                    ) : null}
                  </AnimatedPressable>
                );
              })}
            </ScrollView>
            <AnimatedPressable
              style={styles.closeButton}
              onPress={() => setOpen(false)}
              glowColor={COLORS.accent}
              accessibilityRole="button"
            >
              <Text style={styles.closeText}>Close</Text>
            </AnimatedPressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: NEUMO.title,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  // Soft-glass pill trigger — same extruded recipe as FieldWithIcon.
  field: {
    minHeight: 52,
    backgroundColor: NEUMO.surface,
    borderRadius: NEUMO.inputRadius,
    borderWidth: 0,
    borderTopWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: NEUMO.darkShadow,
    shadowOffset: NEUMO.extrudeOffset,
    shadowOpacity: NEUMO.extrudeOpacity,
    shadowRadius: NEUMO.extrudeRadius,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  value: {
    fontSize: 16,
    color: NEUMO.title,
    flex: 1,
    marginRight: 8,
  },
  placeholder: {
    color: '#334155',
  },
  error: {
    fontSize: 13,
    color: COLORS.danger,
    marginTop: 4,
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.scrim,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  // Frosted white sheet with a soft, deep lift.
  sheet: {
    backgroundColor: COLORS.modal,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    paddingVertical: 12,
    maxHeight: '75%',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.30,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: NEUMO.title,
    letterSpacing: 0.2,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  list: {
    flexGrow: 0,
  },
  option: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 64, 175, 0.08)',
  },
  optionActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  optionText: {
    fontSize: 16,
    color: NEUMO.title,
    flex: 1,
  },
  optionTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  closeButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 64, 175, 0.10)',
    marginTop: 4,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
