import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Scale applied on press-in (default 0.96). */
  pressScale?: number;
  /** Glow color used for the press halo (defaults to the brand navy). */
  glowColor?: string;
  accessibilityRole?: 'button' | 'link' | 'tab';
  accessibilityLabel?: string;
  /** Passed through to the underlying Pressable (e.g. tab selected state). */
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  /** Extra touch area (passed through to Pressable). */
  hitSlop?: number;
  /** Extra style merged when the pointer/web hover is active. */
  hoverStyle?: StyleProp<ViewStyle>;
};

/**
 * Universal animated pressable — every interactive element (buttons, chips,
 * tabs, list actions) wraps this so the whole app shares one motion language:
 *   • press-in  → scale down + a soft colored halo lifts behind the surface
 *   • release   → springs back
 *   • web hover → brightens + lifts slightly (mouse affordance)
 *
 * Built with core `Animated` (no new native deps — matches the rest of the
 * codebase and needs no rebuild). `onHoverIn/Out` are web-only no-ops on
 * native, so the hover affordance degrades gracefully.
 */
export default function AnimatedPressable({
  children,
  onPress,
  disabled = false,
  style,
  pressScale = 0.96,
  glowColor = '#162660',
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityState,
  hitSlop,
  hoverStyle,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (disabled) {
      scale.setValue(1);
      halo.setValue(0);
      lift.setValue(0);
    }
  }, [disabled, scale, halo, lift]);

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: pressScale,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
    Animated.timing(halo, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
    Animated.timing(halo, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const hoverIn = () => {
    Animated.spring(lift, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const hoverOut = () => {
    Animated.spring(lift, {
      toValue: 0,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const haloOpacity = halo.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });
  const translateY = lift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      onHoverIn={hoverIn}
      onHoverOut={hoverOut}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      hitSlop={hitSlop}
    >
      <Animated.View
        style={[
          style,
          { transform: [{ scale }, { translateY }] },
        ]}
      >
        {/* Press halo — a soft colored glow that rises on press. */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: -6,
              right: -6,
              top: -6,
              bottom: -6,
              borderRadius: 18,
              backgroundColor: glowColor,
              opacity: haloOpacity,
            },
          ]}
        />
        {children}
      </Animated.View>
    </Pressable>
  );
}
