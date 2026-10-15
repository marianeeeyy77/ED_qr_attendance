import { StyleSheet, Text, View } from 'react-native';

import { COLORS, withAlpha } from '@/constants/colors';
import type { AttendanceStatus, EventStatus, UserRole } from '@/types/database';

/**
 * Status pill badges shared by every CampusQR screen.
 * Visual language (spec B2): colored text on a ~20% tint with a matching
 * hairline border, uppercase + tracking — always readable on dark glass.
 */

export type PillTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'sky';

const TONE_HEX: Record<PillTone, string> = {
  success: COLORS.success,
  warning: COLORS.warning,
  danger: COLORS.danger,
  info: COLORS.info,
  neutral: COLORS.neutral,
  sky: COLORS.sky,
};

export function eventStatusTone(status: EventStatus): PillTone {
  switch (status) {
    case 'open':
      return 'success';
    case 'draft':
      return 'warning';
    case 'closed':
      return 'neutral';
  }
}

export function attendanceStatusTone(status: AttendanceStatus): PillTone {
  switch (status) {
    case 'present':
      return 'success';
    case 'late':
      return 'warning';
    case 'absent':
      return 'danger';
    case 'excused':
      return 'sky';
  }
}

export function roleTone(role: UserRole): PillTone {
  switch (role) {
    case 'admin':
      return 'danger';
    case 'teacher':
      return 'info';
    case 'student':
      return 'warning';
  }
}

type Props = {
  label: string;
  tone?: PillTone;
};

export default function StatusPill({ label, tone = 'neutral' }: Props) {
  const hex = TONE_HEX[tone];
  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: withAlpha(hex, 0.14),
          borderColor: withAlpha(hex, 0.5),
          shadowColor: hex,
        },
      ]}
    >
      <Text style={[styles.text, { color: hex }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    // Soft tone-tinted glow so the badge lifts off the card.
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
});
