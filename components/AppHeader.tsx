import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Shared header for every CampusQR tab: Royal Navy bar with a rounded-square
 * QR logo mark (3D glow) + bold "School Attendance System".
 */
export default function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <View style={styles.logo}>
          <Ionicons name="qr-code" size={22} color="#FFFFFF" />
        </View>
        <Text style={styles.appName} numberOfLines={1}>
          School Attendance System
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#10367D',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.10)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(208, 230, 253, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(208, 230, 253, 0.45)',
    marginRight: 10,
    shadowColor: '#10367D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  appName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

