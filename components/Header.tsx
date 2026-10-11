import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import Gradient from '@/components/Gradient';
import { GRADIENTS } from '@/constants/colors';

type Props = {
  title: string;
  subtitle?: string;
};

/** Gradient logo mark + app title (spec B2 brand gradient + glow). */
export default function Header({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.logoGlow}>
        <Gradient
          colors={[...GRADIENTS.brand]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoCircle}
        >
          <MaterialIcons name="school" size={36} color="#FFFFFF" />
        </Gradient>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoGlow: {
    borderRadius: 40,
    marginBottom: 14,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 10,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 13,
    color: '#a5b4fc',
    marginTop: 4,
    textAlign: 'center',
  },
});
