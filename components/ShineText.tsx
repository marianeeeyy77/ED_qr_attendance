import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, type TextStyle } from 'react-native';

type Props = {
  children: string;
  style?: TextStyle;
  /** Disable the shifting motion (reduced-motion / tests). */
  animated?: boolean;
};

// The title-shine gradient stops (UI/UX §4.1), interpolated across the text
// color since RN has no `background-clip: text`. Tuned for the light Bone
// theme: the sweep stays in dark navy/royal-blue territory so the title is
// always readable on cream (never washing out to white).
const SHINE_COLORS = [
<<<<<<< HEAD
  '#10367D', // royal navy (base)
  '#5098C3', // royal blue flash
  '#10367D', // royal navy
  '#204C9E', // mid navy
=======
  '#162660', // royal navy (base)
  '#2A5BD7', // royal blue flash
  '#162660', // royal navy
  '#2A3F8F', // mid navy
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
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
<<<<<<< HEAD
    color: '#10367D',
=======
    color: '#162660',
>>>>>>> ff02c248d1985765a235f26c5ed5a386e60bd1b5
  },
});
