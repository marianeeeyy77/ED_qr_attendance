import { StyleSheet, Text, View } from 'react-native';

import AnimatedLogo from '@/components/AnimatedLogo';
import FadeInView from '@/components/FadeInView';
import ShineText from '@/components/ShineText';

type Props = {
  title: string;
  subtitle?: string;
};

/** Gradient logo mark + app title (spec B2 brand gradient + §4 motion). */
export default function Header({ title, subtitle }: Props) {
  return (
    <FadeInView style={styles.container}>
      <View style={styles.logoWrap}>
        <AnimatedLogo size={72} iconSize={36} />
      </View>
      <ShineText style={styles.title}>{title}</ShineText>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoWrap: {
    marginBottom: 14,
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
