import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import AnimatedPressable from '@/components/AnimatedPressable';
import BusyButton from '@/components/BusyButton';
import LockedView from '@/components/LockedView';
import ResultPanel, { type ResultTone } from '@/components/ResultPanel';
import SafeCameraView, { useCameraPermissions } from '@/components/SafeCamera';
import ScreenSheet from '@/components/ScreenSheet';
import ScreenTransition from '@/components/ScreenTransition';
import { useToast } from '@/components/CampusToast';
import { COLORS, NEUMO } from '@/constants/colors';
import { checkIn } from '@/lib/campusqr/attendance';
import { useCampusRole } from '@/lib/campusqr/roles';
import type { CheckInResult, CheckInResultType } from '@/types/database';

const RESULT_TONE: Record<CheckInResultType, ResultTone> = {
  success: 'success',
  duplicate: 'warning',
  closed: 'neutral',
  invalid: 'error',
  unauthorized: 'error',
};

/** Minimum gap between accepted scans — prevents rapid duplicate frames. */
const SCAN_COOLDOWN_MS = 2000;

const RESULT_TITLE: Record<CheckInResultType, string> = {
  success: 'Check-in complete',
  duplicate: 'Already checked in',
  closed: 'Event closed',
  invalid: 'Invalid QR code',
  unauthorized: 'Not allowed',
};

/**
 * Scan QR (camera-only): aligns with Events / My Attendance / Profile —
 * same ScreenSheet + ScreenTransition + ScrollView shell, centered title,
 * static corner reticle (no laser animation), no manual-code fallback.
 */
export default function CampusScanScreen() {
  const { role, loading: roleLoading } = useCampusRole();
  const toast = useToast();
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [busy, setBusy] = useState(false);
  const handlingRef = useRef(false);
  const cooldownRef = useRef(0);

  useFocusEffect(useCallback(() => {
    handlingRef.current = false;
    cooldownRef.current = 0;
  }, []));

  const handleRawScan = async (raw: string) => {
    if (handlingRef.current || busy) return;
    const now = Date.now();
    if (now < cooldownRef.current) return;
    cooldownRef.current = now + SCAN_COOLDOWN_MS;
    handlingRef.current = true;
    setBusy(true);
    try {
      const outcome = await checkIn(raw);
      setResult(outcome);
      const kind =
        outcome.result === 'success' ? 'success'
        : outcome.result === 'duplicate' || outcome.result === 'closed'
          ? 'warning' : 'error';
      toast.show(kind, outcome.message);
    } finally {
      setBusy(false);
    }
  };

  const handleScanAgain = () => {
    setResult(null);
    handlingRef.current = false;
  };

  if (!roleLoading && role !== null && role !== 'student') {
    return <LockedView message="Only student accounts can record attendance." />;
  }

  if (!roleLoading && permission && !permission.granted) {
    return (
      <View style={styles.container}>
        <ScreenSheet>
        <ScreenTransition style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Scan QR</Text>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="camera-outline" size={44} color="#3B82F6" />
            </View>
            <Text style={styles.emptyTitle}>Camera Permission Needed</Text>
            <Text style={styles.emptySub}>We need access to your camera to scan QR codes.</Text>
            <BusyButton title="Grant Permission" loadingTitle="Requesting..." icon="camera-outline" onPress={() => requestPermission()} loading={false} />
          </View>
        </ScrollView>
        </ScreenTransition>
        </ScreenSheet>
      </View>
    );
  }

  const scannerStopped = result !== null;

  return (
    <View style={styles.container}>
      <ScreenSheet>
      <ScreenTransition style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Scan QR</Text>
          <View style={styles.cameraBox}>
            {!scannerStopped ? (
              <View style={styles.cameraFrame}>
                <SafeCameraView style={styles.camera} facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={({ data }) => handleRawScan(data)} />
                <View pointerEvents="none" style={styles.reticle}>
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                </View>
              </View>
            ) : (
              <View style={styles.cameraPaused}>
                <Ionicons name="pause-circle-outline" size={44} color={COLORS.textSecondary} />
                <Text style={styles.hint}>Scanner paused — see your result below.</Text>
              </View>
            )}
            <Text style={styles.helper}>Align QR code within frame to check in</Text>
          </View>
          {busy && !result && <Text style={styles.hint}>Recording attendance...</Text>}
          {result && (
            <View style={styles.resultWrap}>
              <ResultPanel tone={RESULT_TONE[result.result]} title={RESULT_TITLE[result.result]} message={result.message}>
                <AnimatedPressable style={styles.secondaryButton} onPress={handleScanAgain}>
                  <Ionicons name="refresh-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.secondaryText}>Scan again</Text>
                </AnimatedPressable>
              </ResultPanel>
            </View>
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
  scroll: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12 },
  title: { fontSize: 22, fontWeight: '700', color: NEUMO.title, marginBottom: 12, textAlign: 'center', paddingTop: 12 },
  emptyCard: {
    backgroundColor: NEUMO.surface, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    padding: 28, alignItems: 'center',
  },
  emptyIcon: {
    width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(56,189,248,0.12)', borderWidth: 1, borderColor: 'rgba(56,189,248,0.35)',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: NEUMO.title, textAlign: 'center', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#334155', textAlign: 'center', lineHeight: 19, marginBottom: 16 },
  cameraBox: { alignItems: 'center', gap: 10, marginBottom: 16 },
  cameraFrame: { width: '100%', height: 320, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  camera: { width: '100%', height: 320, borderRadius: 16, overflow: 'hidden' },
  reticle: { position: 'absolute', left: 24, right: 24, top: 24, bottom: 24 },
  corner: {
    position: 'absolute', width: 34, height: 34, borderColor: '#3B82F6',
    // Contrast on bright camera feeds: dark shadow (iOS) + elevation (Android);
    // the near-invisible fill gives Android an outline to draw the shadow from.
    backgroundColor: 'rgba(15, 23, 42, 0.01)',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5, shadowRadius: 3, elevation: 4,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
  helper: { fontSize: 13, color: '#334155', textAlign: 'center' },
  cameraPaused: {
    width: '100%', height: 320, borderRadius: 18, backgroundColor: NEUMO.surface,
    borderWidth: 1, borderTopWidth: 1, borderColor: 'rgba(17, 17, 17, 0.06)', borderTopColor: NEUMO.highlight,
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: NEUMO.darkShadow, shadowOffset: NEUMO.extrudeOffset,
    shadowOpacity: NEUMO.extrudeOpacity, shadowRadius: NEUMO.extrudeRadius, elevation: 3,
  },
  hint: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  resultWrap: { width: '100%', marginTop: 8 },
  secondaryButton: {
    minHeight: 44, marginTop: 12, flexDirection: 'row', gap: 6,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16,
  },
  secondaryText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
});
