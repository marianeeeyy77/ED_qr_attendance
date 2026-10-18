import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, type TextStyle } from 'react-native';

import { NEUMO } from '@/constants/colors';

type Props = {
  children: string;
  style?: TextStyle;
  /** Disable the shifting motion (reduced-motion / tests). */
  animated?: boolean;
};

// Mono shine sweep: stays near-black/gray so titles are always readable
// on white (never washing out).
const SHINE_COLORS = [
  '#111111', // near-black (base)
  '#6B6B6B', // gray flash
  '#111111', // near-black
  '#3A3A3A', // dark gray
];

/**
 * Title text with the spec's shifting "shine" (UI/UX §4.1): the color sweeps
 * indigo → white → blue → indigo every 5s. Built with core `Animated`
 * (no new deps). `animated={false}` renders a plain white title.
 */
export default function ShineText({ children, style, animated = true }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: false, // animating color needs the JS driver
      })
    );
    loop.start();
    return () => loop.stop();
  }, [animated, progress]);

  const color = progress.interpolate({
    inputRange: SHINE_COLORS.map((_, i) => i / (SHINE_COLORS.length - 1)),
    outputRange: SHINE_COLORS,
  });

  return (
    <Animated.Text
      style={[styles.title, style, animated ? { color } : styles.staticColor]}
    >
      {children}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  staticColor: {
    color: NEUMO.title,
  },
});
