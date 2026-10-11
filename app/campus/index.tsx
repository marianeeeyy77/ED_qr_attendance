import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GlassCard from '@/components/GlassCard';
import GradientButton from '@/components/GradientButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';

/**
 * Landing portal (spec C5 "Landing"): two glass cards — Personnel
 * (teacher/admin, login only, with the administrator-creation note) and
 * Student (login + register). This is the unauthenticated front door for
 * the CampusQR Attend system.
 */
export default function CampusLandingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="CampusQR Attend"
        subtitle="School Event Attendance System"
      />

      <GlassCard variant="card" style={styles.card}>
        <View style={styles.cardHead}>
          <View style={styles.iconBubble}>
            <Ionicons name="shield-outline" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.cardTitleBox}>
            <Text style={styles.cardTitle}>Personnel</Text>
            <Text style={styles.cardRole}>Teacher &amp; Administrator</Text>
          </View>
        </View>
        <Text style={styles.cardBody}>
          Create and manage events, display QR codes, monitor attendance, and
          run summaries and reports.
        </Text>
        <Text style={styles.note}>
          Personnel accounts are created by an administrator — login only, no
          self-registration.
        </Text>
        <GradientButton
          title="Personnel Sign In"
          variant="personnel"
          onPress={() => router.push('/campus/login')}
          style={styles.button}
        />
      </GlassCard>

      <GlassCard variant="card" style={styles.card}>
        <View style={styles.cardHead}>
          <View style={[styles.iconBubble, styles.iconBubbleAmber]}>
            <Ionicons name="qr-code-outline" size={22} color={COLORS.amber} />
          </View>
          <View style={styles.cardTitleBox}>
            <Text style={styles.cardTitle}>Student</Text>
            <Text style={styles.cardRole}>Scan &amp; check in</Text>
          </View>
        </View>
        <Text style={styles.cardBody}>
          Scan an event QR code to record your attendance and keep track of
          your own attendance history.
        </Text>
        <GradientButton
          title="Create Student Account"
          variant="student"
          onPress={() => router.push('/campus/register')}
          style={styles.button}
        />
        <GradientButton
          title="Student Sign In"
          variant="personnel"
          onPress={() => router.push('/campus/login')}
          style={styles.buttonSpacing}
        />
      </GlassCard>

      <Text style={styles.footer}>Developed by: Leonard V. Abatayo</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99,102,241,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBubbleAmber: {
    backgroundColor: 'rgba(251,191,36,0.20)',
    borderColor: 'rgba(251,191,36,0.5)',
  },
  cardTitleBox: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardRole: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  cardBody: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  note: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 12,
  },
  button: {
    marginTop: 4,
  },
  buttonSpacing: {
    marginTop: 10,
  },
  footer: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
