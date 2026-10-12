import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, type TextStyle } from 'react-native';

type Props = {
  children: string;
  style?: TextStyle;
  /** Disable the shifting motion (reduced-motion / tests). */
  animated?: boolean;
};

// The spec's title-shine gradient stops (UI/UX §4.1), interpolated across
// the text color since RN has no `background-clip: text`.
const SHINE_COLORS = [
  '#818cf8', // indigo-400
  '#ffffff', // white
  '#60a5fa', // blue-400
  '#818cf8', // back to indigo-400
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
    color: '#FFFFFF',
  },
});
