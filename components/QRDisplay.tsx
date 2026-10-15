import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type Props = {
  /** The full QR content, e.g. "CAMPUSQR:<uuid>". */
  value: string;
  size?: number;
  caption?: string;
};

/**
 * Renders an event QR code (react-native-qrcode-svg — already a project
 * dependency). The content always follows the CAMPUSQR:<qr_token> format.
 */
export default function QRDisplay({ value, size = 240, caption }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.qrBox}>
        <QRCode value={value} size={size} />
      </View>
      <Text style={styles.caption}>{caption ?? value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  // White card with a soft, deep lift so the QR reads as a printed tile.
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.10)',
    borderTopColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },
  caption: {
    marginTop: 14,
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 17,
    letterSpacing: 0.2,
  },
});
