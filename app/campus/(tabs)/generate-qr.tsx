import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';

import AnimatedPressable from '@/components/AnimatedPressable';
import Dropdown from '@/components/Dropdown';
import EmptyState from '@/components/EmptyState';
import ScreenSheet from '@/components/ScreenSheet';
import ScreenTransition from '@/components/ScreenTransition';
import { useToast } from '@/components/CampusToast';
import { COLORS, NEUMO, SPACING } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { ensureQrToken, listVisibleEvents, qrPayload } from '@/lib/campusqr/events';
import { formatDateTime } from '@/lib/campusqr/format';
import {
  useCampusRealtime,
  useRealtimeStatusToast,
} from '@/lib/campusqr/realtime';
import { useCampusRole } from '@/lib/campusqr/roles';
import type { EventRow } from '@/types/database';

/**
 * Generate QR (teacher, spec Phase 4): pick one of your events and project
 * its QR code (CAMPUSQR:<token>) for students to scan. Only `open` events
 * accept check-ins, so non-open events show a friendly guard note.
 * Live-refreshes with the shared realtime channel.
 */
export default function GenerateQrScreen() {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useCampusRole();
  const toast = useToast();
  const router = useRouter();
  const onStatus = useRealtimeStatusToast(toast);

  const [events, setEvents] = useState<EventRow[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const rows = await listVisibleEvents(role, user?.id ?? null);
    setEvents(rows);
    setSelectedId((current) =>
      current && rows.some((event) => event.id === current)
        ? current
        : (rows[0]?.id ?? '')
    );
    setLoading(false);
  }, [role, user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  useCampusRealtime(
    (change) => {
      if (change.table === 'events') load();
    },
    onStatus
  );

  const selected = events.find((event) => event.id === selectedId) ?? null;

  // Self-heal: upgraded databases can hold events with qr_token NULL —
  // the QR would encode "CAMPUSQR:null". Generate + persist a token the
  // first time such an event is selected. Best-effort.
  useEffect(() => {
    if (!selected || selected.qr_token) return;
    let active = true;
    ensureQrToken(selected).then((fixed) => {
      if (!active || !fixed.qr_token) return;
      setEvents((prev) => prev.map((event) => (event.id === fixed.id ? fixed : event)));
    });
    return () => {
      active = false;
    };
  }, [selected]);

  return (
    <View style={styles.container}>
      <ScreenSheet>
      <ScreenTransition style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Generate QR</Text>

        {loading ? (
          <Text style={styles.hint}>Loading events...</Text>
        ) : events.length === 0 ? (
          <EmptyState
            icon="qr-code-outline"
            title="No events yet"
            message="Create an event first, then open it to generate its QR code."
          />
        ) : (
          <>
            <Dropdown
              label="Event"
              value={selectedId}
              options={events.map((event) => ({
                label: `${event.name} (${event.status})`,
                value: event.id,
              }))}
              onChange={setSelectedId}
            />

            {selected ? (
              <>
                <View style={styles.selectorCard}>
                  <Text style={styles.selectorTitle} numberOfLines={1}>{selected.name}</Text>
                  <View style={[styles.badge, selected.status === 'open' ? styles.badgeOpen : styles.badgeClosed]}>
                    <Text style={[styles.badgeText, selected.status === 'open' ? styles.badgeOpenText : styles.badgeClosedText]}>
                      {selected.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.mainCard}>
                  <Text style={styles.eventName}>{selected.name}</Text>
                  <Text style={styles.meta}>{formatDateTime(selected.start_datetime)}</Text>
                  {selected.venue ? <Text style={styles.meta}>{selected.venue}</Text> : null}
                  {selected.status !== 'open' ? (
                    <View style={styles.guard}>
                      <Ionicons name="information-circle-outline" size={18} color={COLORS.warning} />
                      <Text style={styles.guardText}>
                        Open the event first — students can only check in while it is open.
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.qrPad}>
                    <QRCode
                      value={qrPayload(selected)}
                      size={230}
                      backgroundColor="#FFFFFF"
                      color="#0F172A"
                      quietZone={8}
                      ecl="H"
                    />
                  </View>
                  <View style={styles.codePill}>
                    <Text style={styles.codeText}>{qrPayload(selected)}</Text>
                  </View>
                  <View style={styles.qrMetaRow}>
                    <View style={styles.tipRow}>
                      <Ionicons name="information-circle-outline" size={14} color="#334155" />
                      <Text style={styles.tipText}>Project this code for students to scan while the event is open</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.actionRow}>
                  <AnimatedPressable
                    style={[styles.actionBtn, { backgroundColor: NEUMO.title }]}
                    outerStyle={styles.actionBtnOuter}
                    onPress={() => router.push(`/campus/qr-display?id=${selected.id}`)}
                    glowColor={COLORS.primary}
                    accessibilityRole="button"
                    accessibilityLabel="Fullscreen"
                  >
                    <Ionicons name="expand-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Fullscreen</Text>
                  </AnimatedPressable>
                  <AnimatedPressable
                    style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]}
                    outerStyle={styles.actionBtnOuter}
                    onPress={() => toast.info('Type the code shown into the Scan screen.')}
                    glowColor="#3B82F6"
                    accessibilityRole="button"
                    accessibilityLabel="Copy Code"
                  >
                    <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Copy Code</Text>
                  </AnimatedPressable>
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
      </ScreenTransition>
      </ScreenSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12, alignItems: 'stretch' },
  title: { fontSize: 22, fontWeight: '700', color: NEUMO.title, marginBottom: 12, textAlign: 'center' },
  hint: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: 24 },
  selectorCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: NEUMO.surface, borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight, padding: 14, marginBottom: 12,
  },
  selectorTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: NEUMO.title },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  badgeOpen: { backgroundColor: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.4)' },
  badgeClosed: { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.35)' },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  badgeOpenText: { color: '#10B981' },
  badgeClosedText: { color: '#EF4444' },
  mainCard: {
    backgroundColor: NEUMO.surface, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight, padding: 16, alignItems: 'center',
  },
  eventName: { fontSize: 20, fontWeight: '700', color: NEUMO.title, textAlign: 'center' },
  meta: { fontSize: 13, color: '#334155', marginBottom: 2, textAlign: 'center' },
  guard: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
    backgroundColor: NEUMO.surface, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    paddingHorizontal: 12, paddingVertical: 10, width: '100%',
  },
  guardText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 18 },
  qrPad: {
    marginTop: 16, backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: 'rgba(30, 64, 175, 0.2)',
  },
  codePill: {
    marginTop: 14, backgroundColor: NEUMO.surface, padding: 10,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    width: '100%',
  },
  codeText: { color: NEUMO.title, fontWeight: '700', textAlign: 'center', fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: SPACING.buttonGap, marginTop: 14 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 13, minHeight: 48,
  },
  // The outer Pressable must also flex so both buttons split the full row width.
  actionBtnOuter: { flex: 1 },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  qrMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' },
  tipText: { fontSize: 12, color: '#334155', textAlign: 'center' },
});
