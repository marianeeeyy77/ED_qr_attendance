import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { NEUMO } from '@/constants/colors';

type Props = {
  children: React.ReactNode;
};

/**
 * Web keeps a flat ultra-soft cool-grey fill (styling-only refresh).
 * (`backgroundImage` is web-only CSS that RN's ViewStyle type doesn't model.)
 */
const WEB_BG_STYLE = {
  ...StyleSheet.absoluteFillObject,
  backgroundImage: 'none',
  backgroundColor: NEUMO.background,
} as unknown as StyleProp<ViewStyle>;

/**
 * Global Soft Glass background (styling-only): flat soft ice-blue `#F0F5FA`
 * field (from constants/theme.ts via NEUMO.background). The old grey-radial
 * + aurora stack was removed so extruded surfaces read cleanly. No logic or
 * navigation here.
 */
export default function AppBackground({ children }: Props) {
  return (
    <View style={styles.root}>
      <View
        pointerEvents="none"
        style={Platform.OS === 'web' ? WEB_BG_STYLE : StyleSheet.absoluteFill}
      >
        {Platform.OS !== 'web' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: NEUMO.background }]} />
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: NEUMO.background,
  },
  content: {
    flex: 1,
  },
});
