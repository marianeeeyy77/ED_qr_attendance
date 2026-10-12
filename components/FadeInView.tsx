import { useEffect, useRef } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Disable the entrance animation (reduced-motion / tests). */
  animated?: boolean;
  /** Stagger the entrance (ms) — useful for lists of cards. */
  delay?: number;
};

/**
 * Screen/card entrance (UI/UX §4): fades in and rises 4px over ~250ms with
 * an ease-out. Built with core `Animated` (no new deps); respects a small
 * `delay` for staggered reveals.
 */
export default function FadeInView({
  children,
  style,
  animated = true,
  delay = 0,
}: Props) {
  const progress = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (!animated) return;
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
    const t = setTimeout(() => anim.start(), delay);
    return () => {
      clearTimeout(t);
      anim.stop();
    };
  }, [animated, delay, progress]);

  const opacity = progress;
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 0],
  });

  return (
    <Animated.View style={[style, { opacity }, { transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
