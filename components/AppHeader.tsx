import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Gradient from '@/components/Gradient';
import { GRADIENTS, NEUMO } from '@/constants/colors';

/**
 * Shared header for every CampusQR tab (black & pink): pink gradient bar
 * + white logo tile. Serves the Student, Teacher and Admin interfaces.
 */
export default function AppHeader() {
  const insets = useSafeAreaInsets();

  return (
    <Gradient
      colors={GRADIENTS.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.bar, { paddingTop: insets.top }]}
    >
      <View style={styles.inner}>
        <View style={styles.logo}>
          <Ionicons name="qr-code" size={22} color="#111111" />
        </View>
        <Text style={styles.appName} numberOfLines={1}>
          QR Attendance
        </Text>
      </View>
    </Gradient>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    marginRight: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

