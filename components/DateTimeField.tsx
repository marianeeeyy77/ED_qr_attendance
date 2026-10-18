import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';

import { COLORS, NEUMO } from '@/constants/colors';
import { formatDateTime } from '@/lib/campusqr/format';

/** Formats a Date as a local wall-time ISO string (YYYY-MM-DDTHH:MM:SS),
 * matching the convention already used by the pre-existing app. */
export function toLocalISO(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:00`
  );
}

type Props = {
  label: string;
  value: string | null;
  onChange: (iso: string | null) => void;
  disabled?: boolean;
};

/**
 * Date + time picker for the event form. iOS shows the inline spinner
 * control; Android walks date -> time dialogs. Already a project
 * dependency (@react-native-community/datetimepicker).
 */
export default function DateTimeField({
  label,
  value,
  onChange,
  disabled = false,
}: Props) {
  const [show, setShow] = useState(false);
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>('date');
  const [pendingDate, setPendingDate] = useState<Date | null>(null);

  const current = value ? new Date(value) : new Date();

  const open = () => {
    if (disabled) return;
    setAndroidStep('date');
    setPendingDate(null);
    setShow(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed' || !date) {
      setShow(false);
      return;
    }
    if (androidStep === 'date') {
      setPendingDate(date);
      setAndroidStep('time');
      return;
    }
    const base = pendingDate ?? new Date();
    const combined = new Date(base);
    combined.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChange(toLocalISO(combined));
    setShow(false);
  };

  const handleIOSChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed' || !date) {
      setShow(false);
      return;
    }
    onChange(toLocalISO(date));
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.field, disabled && styles.disabled]}
          onPress={open}
          disabled={disabled}
          accessibilityRole="button"
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={COLORS.textSecondary}
            style={styles.icon}
          />
          <Text style={[styles.value, !value && styles.placeholder]}>
            {value ? formatDateTime(value) : 'Select date and time'}
          </Text>
        </Pressable>
        {value && !disabled && (
          <Pressable
            style={styles.clear}
            onPress={() => onChange(null)}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </Pressable>
        )}
      </View>

      {show &&
        (Platform.OS === 'ios' ? (
          <View style={styles.iosPicker}>
            <DateTimePicker
              value={current}
              mode="datetime"
              display="spinner"
              onChange={handleIOSChange}
            />
            <Pressable
              style={styles.doneButton}
              onPress={() => setShow(false)}
              accessibilityRole="button"
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <DateTimePicker
            value={androidStep === 'date' ? current : (pendingDate ?? current)}
            mode={androidStep === 'date' ? 'date' : 'time'}
            display="default"
            onChange={handleAndroidChange}
          />
        ))}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // Soft-glass pill field — same extruded recipe as FieldWithIcon.
  field: {
    flex: 1,
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
    shadowColor: NEUMO.darkShadow,
    shadowOffset: NEUMO.extrudeOffset,
    shadowOpacity: NEUMO.extrudeOpacity,
    shadowRadius: NEUMO.extrudeRadius,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 8,
  },
  value: {
    fontSize: 15,
    color: NEUMO.title,
    flex: 1,
  },
  placeholder: {
    color: '#334155',
  },
  clear: {
    padding: 6,
  },
  iosPicker: {
    backgroundColor: NEUMO.surface,
    borderRadius: NEUMO.cardRadius,
    borderWidth: 0,
    borderTopWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    marginTop: 8,
    overflow: 'hidden',
    shadowColor: NEUMO.darkShadow,
    shadowOffset: NEUMO.extrudeOffset,
    shadowOpacity: NEUMO.extrudeOpacity,
    shadowRadius: NEUMO.extrudeRadius,
    elevation: 4,
  },
  doneButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 64, 175, 0.10)',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
