import { memo } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { COLORS, NEUMO } from '@/constants/colors';

type Props = TextInputProps & {
  /** LeftGlyph shown inside the field (Ionicons name). */
  icon: keyof typeof Ionicons.glyphMap;
  /** Outer pill — carries background / border / radius / padding. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Inner text element — flexes to fill the row. */
  inputStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  iconColor?: string;
};

/**
 * Text field with a leading icon inside the placeholder row.
 * One shared motion language: no animation here (parent screens own the
 * entrance), just a stable row so every `placeholder="..."` input reads
 * the same — icon left, text fills the rest. Memoized so list renders
 * (Manage Users, AttendanceRecords) don't re-render every row on keystroke.
 */
function FieldWithIcon({
  icon,
  containerStyle,
  inputStyle,
  iconSize = 18,
  iconColor = COLORS.textSecondary,
  placeholderTextColor = COLORS.textSecondary,
  ...rest
}: Props) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.icon} />
      <TextInput
        style={[styles.input, inputStyle]}
        placeholderTextColor={placeholderTextColor}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Soft-glass pill input (styling-only): extruded same-as-bg surface,
  // rounded pill border, soft shadow + light top edge for depth.
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NEUMO.surface,
    borderRadius: NEUMO.inputRadius,
    borderWidth: 0,
    borderTopWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    paddingHorizontal: 16,
    minHeight: 52,
    shadowColor: NEUMO.darkShadow,
    shadowOffset: NEUMO.extrudeOffset,
    shadowOpacity: NEUMO.extrudeOpacity,
    shadowRadius: NEUMO.extrudeRadius,
    elevation: 3,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 24,
    paddingVertical: 0,
  },
});

export default memo(FieldWithIcon);
