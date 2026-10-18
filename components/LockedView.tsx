import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, NEUMO } from '@/constants/colors';

/**
 * Shown on screens a role cannot access. Combined with hidden tabs this
 * keeps role gating airtight even for deep links (spec section 2).
 */
type Props = {
  title?: string;
  message?: string;
};

export default function LockedView({
  title = 'Access Restricted',
  message = 'Your account does not have access to this screen.',
}: Props) {
  return (
    <View style={styles.container}>
      {/* Soft-glass card with an icon medallion (styling-only). */}
      <View style={styles.card}>
        <View style={styles.iconHalo}>
          <Ionicons name="lock-closed-outline" size={34} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: NEUMO.surface,
    borderRadius: NEUMO.cardRadius,
    borderWidth: 1,
    borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    paddingVertical: 28,
    paddingHorizontal: 24,
    shadowColor: NEUMO.darkShadow,
    shadowOffset: NEUMO.extrudeOffset,
    shadowOpacity: NEUMO.extrudeOpacity,
    shadowRadius: NEUMO.extrudeRadius,
    elevation: 4,
  },
  iconHalo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: NEUMO.title,
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 20,
  },
});
