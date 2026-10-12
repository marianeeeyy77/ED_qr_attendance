import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FadeInView from '@/components/FadeInView';
import GlassCard from '@/components/GlassCard';
import GradientButton from '@/components/GradientButton';
import Header from '@/components/Header';
import { COLORS } from '@/constants/colors';

/**
 * Landing portal: a single welcome card with Log In and Sign Up for all
 * users. New accounts always start as Student (the database trigger
 * hardcodes it) — personnel roles are assigned later by an administrator.
 * This is the unauthenticated front door for the CampusQR Attend system.
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

      <FadeInView delay={60}>
        <GlassCard variant="card" style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.iconBubble}>
              <Ionicons name="qr-code-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.cardTitleBox}>
              <Text style={styles.cardTitle}>Welcome to CampusQR Attend</Text>
              <Text style={styles.cardRole}>School Event Attendance System</Text>
            </View>
          </View>
          <Text style={styles.cardBody}>
            Sign in to manage events, scan QR codes, and track attendance.
          </Text>
          <Text style={styles.note}>
            New accounts start as Student — personnel roles are assigned by an
            administrator.
          </Text>
          <GradientButton
            title="Log In"
            variant="personnel"
            onPress={() => router.push('/campus/login')}
            style={styles.button}
          />
          <GradientButton
            title="Sign Up"
            variant="student"
            onPress={() => router.push('/campus/register')}
            style={styles.buttonSpacing}
          />
        </GlassCard>
      </FadeInView>

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
