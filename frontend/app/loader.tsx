import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withRepeat,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  Easing,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

const { width: SCREEN_W } = Dimensions.get("window");

// --------------------------------------------------------------------------
// Design tokens (shared with the app)
// --------------------------------------------------------------------------
const C = {
  bg: "#F2F1E6",
  bgSoft: "#EDECDF",
  ink: "#0A0A0A",
  inkSoft: "#1A1A18",
  mute: "#6E6E66",
  hair: "rgba(10,10,10,0.08)",
  glassStrong: "rgba(255,255,255,0.75)",
  lime: "#DAFE4C",
  limeDeep: "#B8E132",
  white: "#FFFFFF",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --------------------------------------------------------------------------
// Ambient orbs — same warm/lime atmosphere as the app
// --------------------------------------------------------------------------
function AmbientBackdrop() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [t]);
  const orb1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [-40, 40]) },
      { translateY: interpolate(t.value, [0, 1], [-20, 20]) },
      { scale: interpolate(t.value, [0, 1], [1, 1.15]) },
    ],
  }));
  const orb2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(t.value, [0, 1], [30, -30]) },
      { translateY: interpolate(t.value, [0, 1], [10, -10]) },
      { scale: interpolate(t.value, [0, 1], [1.1, 0.95]) },
    ],
  }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.orb, styles.orbTop, orb1]} />
      <Animated.View style={[styles.orb, styles.orbMid, orb2]} />
    </View>
  );
}

// --------------------------------------------------------------------------
// Orbiting dot around the brand — one instance per dot
// --------------------------------------------------------------------------
function OrbitDot({
  progress,
  offset,
  radius,
  size = 8,
  color = C.lime,
}: {
  progress: Animated.SharedValue<number>;
  offset: number;
  radius: number;
  size?: number;
  color?: string;
}) {
  const style = useAnimatedStyle(() => {
    const rad = (progress.value + offset) * Math.PI * 2;
    return {
      transform: [
        { translateX: Math.cos(rad) * radius },
        { translateY: Math.sin(rad) * radius },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: 1.5,
          borderColor: C.ink,
        },
        style,
      ]}
    />
  );
}

// --------------------------------------------------------------------------
// Breathing bloom behind the brand
// --------------------------------------------------------------------------
function Bloom() {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [p]);
  const s = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(p.value, [0, 1], [0.9, 1.15]) }],
    opacity: interpolate(p.value, [0, 1], [0.5, 0.85]),
  }));
  const s2 = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(p.value, [0, 1], [1.15, 0.95]) }],
    opacity: interpolate(p.value, [0, 1], [0.25, 0.55]),
  }));
  return (
    <>
      <Animated.View style={[styles.bloom, s]} />
      <Animated.View style={[styles.bloomOuter, s2]} />
    </>
  );
}

// --------------------------------------------------------------------------
// ECG heart-rate line (SVG-less approximation using absolutely-positioned
// tick segments that "pulse" left-to-right)
// --------------------------------------------------------------------------
const ECG_STEPS = [
  { h: 4, w: 10 }, { h: 4, w: 8 }, { h: 4, w: 8 },
  { h: 18, w: 4 }, { h: 32, w: 4 }, { h: 46, w: 4 },
  { h: 8, w: 4 }, { h: 4, w: 24 }, { h: 4, w: 8 },
  { h: 4, w: 6 }, { h: 24, w: 4 }, { h: 12, w: 4 },
  { h: 4, w: 30 }, { h: 4, w: 12 }, { h: 4, w: 8 },
];

function ECGLine() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.linear }), -1, false);
  }, [t]);

  return (
    <View style={styles.ecgWrap} pointerEvents="none">
      {/* Base track */}
      <View style={styles.ecgTrack} />
      {/* Steps forming a heartbeat */}
      <View style={styles.ecgSteps}>
        {ECG_STEPS.map((s, i) => (
          <ECGBar key={i} index={i} h={s.h} w={s.w} progress={t} total={ECG_STEPS.length} />
        ))}
      </View>
    </View>
  );
}

function ECGBar({
  index,
  h,
  w,
  progress,
  total,
}: {
  index: number;
  h: number;
  w: number;
  progress: Animated.SharedValue<number>;
  total: number;
}) {
  const my = index / total;
  const window = 0.18;
  const style = useAnimatedStyle(() => {
    // sweep window over bars
    const p = progress.value;
    let d = my - p;
    // wrap
    if (d < -0.5) d += 1;
    if (d > 0.5) d -= 1;
    const near = Math.max(0, 1 - Math.abs(d) / window);
    return {
      backgroundColor: near > 0 ? C.lime : C.ink,
      transform: [{ scaleY: 1 + near * 0.4 }],
      opacity: 0.65 + near * 0.35,
    };
  });
  return (
    <Animated.View
      style={[
        {
          width: w,
          height: h,
          borderRadius: 2,
          marginHorizontal: 1,
        },
        style,
      ]}
    />
  );
}

// --------------------------------------------------------------------------
// Vertical bar equalizer (fitness "reps" vibe)
// --------------------------------------------------------------------------
function Equalizer() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.linear }), -1, false);
  }, [t]);
  const bars = [0, 0.15, 0.3, 0.45, 0.6, 0.75];
  return (
    <View style={styles.eq}>
      {bars.map((phase, i) => (
        <EqBar key={i} phase={phase} t={t} />
      ))}
    </View>
  );
}

function EqBar({ phase, t }: { phase: number; t: Animated.SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const v = (Math.sin((t.value + phase) * Math.PI * 2) + 1) / 2;
    return {
      height: 6 + v * 22,
      opacity: 0.6 + v * 0.4,
    };
  });
  return <Animated.View style={[styles.eqBar, style]} />;
}

// --------------------------------------------------------------------------
// Progress bar with animated % counter
// --------------------------------------------------------------------------
function ProgressStrip() {
  const p = useSharedValue(0);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    p.value = withRepeat(
      withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false
    );
    const id = setInterval(() => {
      // ease-in-out synced with p
      const now = (Date.now() / 3600) % 1;
      const eased =
        now < 0.5
          ? 2 * now * now
          : 1 - Math.pow(-2 * now + 2, 2) / 2;
      setPct(Math.min(100, Math.round(eased * 100)));
    }, 60);
    return () => clearInterval(id);
  }, [p]);

  const fill = useAnimatedStyle(() => ({
    width: `${p.value * 100}%`,
  }));
  const shine = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(p.value, [0, 1], [-100, SCREEN_W * 0.7]) },
    ],
    opacity: interpolate(p.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
  }));
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTop}>
        <View style={styles.progressLive}>
          <View style={styles.progressLiveDot} />
          <Text style={styles.progressLiveText}>SYNCING</Text>
        </View>
        <Text style={styles.progressPct}>{String(pct).padStart(2, "0")}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, fill]}>
          <Animated.View style={[styles.progressShine, shine]}>
            <LinearGradient
              colors={[
                "transparent",
                "rgba(10,10,10,0.35)",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Ticker (marquee) — motivational phrases loop
// --------------------------------------------------------------------------
function Ticker() {
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withRepeat(
      withTiming(-SCREEN_W, { duration: 16000, easing: Easing.linear }),
      -1,
      false
    );
  }, [x]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));
  return (
    <View style={styles.ticker}>
      <Animated.View style={[styles.tickerRow, style]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Text key={i} style={styles.tickerText}>
            ◇ WARMING UP  ◇ TUNING YOUR PULSE  ◇ BUILDING YOUR DAY  ◇ HABIT 101  {" "}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Rotating brand ring (dashed effect via colored blocks)
// --------------------------------------------------------------------------
function BrandRing() {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  }, [rot]);
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value * 360}deg` }],
  }));

  // 24 short bars around the ring
  const bars = Array.from({ length: 24 });
  return (
    <Animated.View style={[styles.brandRing, style]}>
      {bars.map((_, i) => {
        const angle = (i / bars.length) * 360;
        const lime = i % 4 === 0;
        return (
          <View
            key={i}
            style={[
              styles.ringTick,
              {
                transform: [
                  { rotate: `${angle}deg` },
                  { translateY: -108 },
                ],
                backgroundColor: lime ? C.lime : C.ink,
                width: lime ? 3 : 2,
                height: lime ? 14 : 8,
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Loader Screen
// --------------------------------------------------------------------------
export default function Loader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Master orbit rotation
  const orbit = useSharedValue(0);
  useEffect(() => {
    orbit.value = withRepeat(
      withTiming(1, { duration: 4200, easing: Easing.linear }),
      -1,
      false
    );
  }, [orbit]);

  // Brand entrance
  const brandEnter = useSharedValue(0);
  useEffect(() => {
    brandEnter.value = withDelay(120, withSpring(1, { damping: 14, stiffness: 140 }));
  }, [brandEnter]);
  const brandStyle = useAnimatedStyle(() => ({
    opacity: interpolate(brandEnter.value, [0, 1], [0, 1]),
    transform: [
      { scale: interpolate(brandEnter.value, [0, 1], [0.85, 1]) },
      { translateY: interpolate(brandEnter.value, [0, 1], [10, 0]) },
    ],
  }));

  // Big "101" numeric heartbeat
  const beat = useSharedValue(1);
  useEffect(() => {
    beat.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 220 }),
        withTiming(0.98, { duration: 180 }),
        withTiming(1.04, { duration: 220 }),
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 700 })
      ),
      -1,
      false
    );
  }, [beat]);
  const beatStyle = useAnimatedStyle(() => ({
    transform: [{ scale: beat.value }],
  }));

  const handleSkip = () => {
    if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
    router.replace("/");
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AmbientBackdrop />

      {/* Top: brand corner mark */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.brandCorner}>
          <View style={styles.brandDot} />
          <Text style={styles.brandCornerText}>◇ HABIT 101 · FITNESS</Text>
        </View>
        <Pressable style={styles.skipBtn} onPress={handleSkip} testID="skip-loader">
          <Text style={styles.skipText}>Skip</Text>
          <Feather name="arrow-right" size={13} color={C.ink} />
        </Pressable>
      </View>

      {/* Center — brand + orbit */}
      <Animated.View style={[styles.center, brandStyle]} testID="loader-brand">
        <Bloom />

        {/* Rotating brand ring */}
        <BrandRing />

        {/* Orbiting dots */}
        <OrbitDot progress={orbit} offset={0} radius={120} size={12} color={C.lime} />
        <OrbitDot progress={orbit} offset={1 / 3} radius={120} size={8} color={C.ink} />
        <OrbitDot progress={orbit} offset={2 / 3} radius={120} size={10} color="#FFC9A8" />

        {/* Wordmark */}
        <View style={styles.brand}>
          <Text style={styles.brandKicker}>◇ THE FITNESS OS</Text>
          <View style={styles.brandRow}>
            <Text style={styles.brandName}>habit</Text>
            <Animated.Text style={[styles.brandNum, beatStyle]}>101</Animated.Text>
          </View>
          <View style={styles.brandUnderline}>
            <View style={styles.brandUnderlineFill} />
          </View>

          {/* ECG line */}
          <ECGLine />

          {/* Equalizer bars + tiny live pill */}
          <View style={styles.brandFooter}>
            <Equalizer />
            <View style={styles.brandLive}>
              <View style={styles.brandLiveDot} />
              <Text style={styles.brandLiveText}>LIVE</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Bottom stack */}
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Ticker />
        <ProgressStrip />
        <View style={styles.footerRow}>
          <Text style={styles.footerA}>v 1.0.1</Text>
          <View style={styles.footerBrand}>
            <Ionicons name="fitness" size={12} color={C.lime} />
            <Text style={styles.footerBrandText}>build the habit · repeat</Text>
          </View>
          <Text style={styles.footerA}>© 2026</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, justifyContent: "space-between" },

  orb: {
    position: "absolute",
    borderRadius: 400,
    backgroundColor: C.lime,
    opacity: 0.45,
  },
  orbTop: { width: 360, height: 360, top: -140, right: -120 },
  orbMid: {
    width: 300,
    height: 300,
    top: 380,
    left: -120,
    backgroundColor: "#FFE9A8",
    opacity: 0.35,
  },

  // Top bar
  topBar: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandCorner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.ink,
  },
  brandDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  brandCornerText: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "900",
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.glassStrong,
    borderWidth: 1,
    borderColor: C.hair,
  },
  skipText: { fontSize: 12, fontWeight: "800", color: C.ink },

  // Center
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bloom: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: C.lime,
    opacity: 0.55,
  },
  bloomOuter: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 1.5,
    borderColor: C.ink,
    borderStyle: "dashed",
    opacity: 0.3,
  },

  // Brand ring
  brandRing: {
    position: "absolute",
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
  ringTick: {
    position: "absolute",
    borderRadius: 2,
  },

  // Wordmark
  brand: {
    zIndex: 2,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  brandKicker: {
    color: C.limeDeep,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "900",
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  brandName: {
    fontSize: 62,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -3,
    lineHeight: 62,
  },
  brandNum: {
    fontSize: 62,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -3,
    lineHeight: 62,
    backgroundColor: C.lime,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  brandUnderline: {
    marginTop: 8,
    width: 220,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.hair,
    overflow: "hidden",
  },
  brandUnderlineFill: {
    width: "70%",
    height: "100%",
    backgroundColor: C.ink,
    borderRadius: 2,
  },
  ecgWrap: {
    marginTop: 22,
    width: 240,
    height: 56,
    borderRadius: 14,
    backgroundColor: C.ink,
    padding: 8,
    justifyContent: "center",
    overflow: "hidden",
  },
  ecgTrack: {
    position: "absolute",
    left: 8,
    right: 8,
    top: "50%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  ecgSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  brandFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eq: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 28,
  },
  eqBar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: C.ink,
  },
  brandLive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: C.lime,
    borderWidth: 1,
    borderColor: C.ink,
  },
  brandLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.ink },
  brandLiveText: { fontSize: 10, letterSpacing: 1.4, fontWeight: "900", color: C.ink },

  // Bottom
  bottom: {
    paddingHorizontal: 20,
    gap: 14,
  },
  ticker: {
    height: 28,
    borderRadius: 14,
    backgroundColor: C.ink,
    justifyContent: "center",
    overflow: "hidden",
  },
  tickerRow: { flexDirection: "row" },
  tickerText: {
    color: C.lime,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "800",
  },

  progressWrap: {
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    padding: 14,
    shadowColor: C.ink,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  progressTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressLive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: C.ink,
  },
  progressLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.lime,
  },
  progressLiveText: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  progressPct: {
    fontSize: 22,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.6,
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: C.bgSoft,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: C.lime,
    overflow: "hidden",
  },
  progressShine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 100,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  footerA: {
    fontSize: 10,
    color: C.mute,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  footerBrandText: {
    fontSize: 10,
    color: C.ink,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
});
