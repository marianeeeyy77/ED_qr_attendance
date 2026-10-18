import { StyleSheet, Text, View } from 'react-native';

import { COLORS, withAlpha } from '@/constants/colors';

export type ResultTone = 'success' | 'error' | 'warning' | 'info' | 'neutral';

/**
 * Tone → color mapping. Backgrounds are the tone at low alpha with a
 * matching border so the panel reads as a frosted glass surface on the
 * dark radial background (spec B2 result panels).
 */
const TONE_HEX: Record<ResultTone, string> = {
  success: COLORS.success,
  error: COLORS.danger,
  warning: COLORS.warning,
  info: COLORS.info,
  neutral: COLORS.neutral,
};

type Props = {
  tone: ResultTone;
  title?: string;
  message: string;
  children?: React.ReactNode;
};

/**
 * Persistent result panel (spec UX): shown after a scan while the
 * scanner stays stopped; carries the exact result copy plus actions
 * (e.g. the "Scan again" button rendered by the caller).
 */
export default function ResultPanel({ tone, title, message, children }: Props) {
  const hex = TONE_HEX[tone];
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: withAlpha(hex, 0.12), borderColor: withAlpha(hex, 0.55) },
      ]}
    >
      {title ? (
        <Text style={[styles.title, { color: hex }]}>{title}</Text>
      ) : null}
      <Text style={styles.message}>{message}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.06)',
    padding: 18,
    width: '100%',
    alignItems: 'center',
    // Frosted lift so the result reads as a glass panel on the sheet.
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  message: {
    fontSize: 14,
    color: '#111111',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
});
