import React, { useEffect, useRef, useState } from "react";
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
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
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
  FadeInDown,
  FadeIn,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width: SCREEN_W } = Dimensions.get("window");

// --------------------------------------------------------------------------
// Design tokens
// --------------------------------------------------------------------------
const C = {
  bg: "#F2F1E6",
  bgSoft: "#EDECDF",
  ink: "#0A0A0A",
  inkSoft: "#1A1A18",
  mute: "#6E6E66",
  hair: "rgba(10,10,10,0.08)",
  glass: "rgba(255,255,255,0.55)",
  glassStrong: "rgba(255,255,255,0.75)",
  lime: "#DAFE4C",
  limeDeep: "#B8E132",
  white: "#FFFFFF",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const buzz = (kind: "light" | "medium" = "light") => {
  if (Platform.OS === "web") return;
  if (kind === "light") Haptics.selectionAsync().catch(() => {});
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

// --------------------------------------------------------------------------
// Ambient backdrop (subtle drifting orbs)
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
// Header
// --------------------------------------------------------------------------
function Header() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.header, { paddingTop: insets.top + 6 }]}
      testID="dashboard-header"
    >
      <View style={styles.headerRow}>
        <View style={styles.avatarLg}>
          <LinearGradient
            colors={[C.lime, "#F0FF7E"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.avatarText}>P</Text>
          <View style={styles.avatarStatus} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerHello}>Good morning</Text>
          <Text style={styles.headerTitle}>Priya</Text>
        </View>
        <Pressable style={styles.headerIcon} testID="notif-btn">
          <Ionicons name="notifications-outline" size={20} color={C.ink} />
          <View style={styles.headerIconDot} />
        </Pressable>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Simple hero card
// --------------------------------------------------------------------------
function HeroCard() {
  return (
    <Animated.View
      entering={FadeInDown.duration(520).delay(80)}
      style={styles.heroCard}
      testID="hero-card"
    >
      <View style={styles.heroImgWrap}>
        <Image
          source="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&q=80"
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.75)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroTicker}>
          <Text style={styles.heroTickerText}>◇ TODAY  ◇ TODAY  ◇ TODAY</Text>
        </View>

        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <View style={styles.limeSquare} />
            <Text style={styles.heroBadgeText}>NEXT SESSION</Text>
          </View>
          <View style={styles.heroCountdown}>
            <Text style={styles.heroCountdownText}>02 : 45</Text>
          </View>
        </View>

        <View style={styles.heroBottom}>
          <Text style={styles.heroKicker}>YOGA · MOBILITY</Text>
          <Text style={styles.heroTitle}>Sunset{"\n"}Vinyasa</Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaChip}>
              <Ionicons name="time-outline" size={12} color={C.white} />
              <Text style={styles.heroMetaText}>6:30 PM</Text>
            </View>
            <View style={styles.heroMetaChip}>
              <Ionicons name="location-outline" size={12} color={C.white} />
              <Text style={styles.heroMetaText}>Juhu Beach</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Quick actions grid
// --------------------------------------------------------------------------
const QUICK = [
  { key: "book", label: "Book", sub: "3 upcoming", icon: "calendar-outline" as const, bg: C.ink, fg: C.lime },
  { key: "explore", label: "Explore", sub: "48 events", icon: "compass-outline" as const, bg: C.white, fg: C.ink },
  { key: "streak", label: "Streak", sub: "12 days", icon: "flame-outline" as const, bg: C.lime, fg: C.ink },
  { key: "log", label: "Log", sub: "Yoga · 25m", icon: "add-circle-outline" as const, bg: C.white, fg: C.ink },
];

function QuickActions() {
  return (
    <View style={styles.quickWrap} testID="quick-actions">
      {QUICK.map((q, i) => (
        <AnimatedPressable
          key={q.key}
          entering={FadeInDown.duration(400).delay(120 + i * 60)}
          onPress={() => buzz()}
          style={[styles.quickCard, { backgroundColor: q.bg }]}
          testID={`quick-${q.key}`}
        >
          <View
            style={[
              styles.quickIcon,
              { backgroundColor: q.bg === C.white ? C.bg : "rgba(255,255,255,0.14)" },
            ]}
          >
            <Ionicons name={q.icon} size={18} color={q.fg} />
          </View>
          <Text style={[styles.quickLabel, { color: q.fg }]}>{q.label}</Text>
          <Text
            style={[
              styles.quickSub,
              {
                color:
                  q.bg === C.ink
                    ? "rgba(255,255,255,0.55)"
                    : q.bg === C.lime
                    ? C.inkSoft
                    : C.mute,
              },
            ]}
          >
            {q.sub}
          </Text>
        </AnimatedPressable>
      ))}
    </View>
  );
}

// --------------------------------------------------------------------------
// ULTRA CREATIVE BOTTOM NAVBAR
//   - Floating dock with animated sliding lime capsule indicator
//   - Active icon bloom (lime glow disc) + spring lift
//   - Center raised FAB (+ button) — rotates 45° when radial menu open
//   - Long-press FAB → radial fan of 3 quick action bubbles (Event / Post / Booking)
//   - Concave-look notch via a lifted FAB sitting over the dock
// --------------------------------------------------------------------------
const NAV_ITEMS = [
  { key: "home", icon: "home" as const, iconOutline: "home-outline" as const, label: "Home" },
  { key: "explore", icon: "compass" as const, iconOutline: "compass-outline" as const, label: "Explore" },
  // slot for FAB
  { key: "community", icon: "people" as const, iconOutline: "people-outline" as const, label: "Crew" },
  { key: "profile", icon: "person" as const, iconOutline: "person-outline" as const, label: "You" },
];

const FAB_ACTIONS = [
  { key: "event", icon: "calendar" as const, label: "Event", color: "#DAFE4C" },
  { key: "post", icon: "chatbubble-ellipses" as const, label: "Post", color: "#FFC9A8" },
  { key: "booking", icon: "flash" as const, label: "Book", color: "#BFE8FF" },
];

function CreativeBottomNav() {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(0);
  const [dockW, setDockW] = useState(0);
  const [fanOpen, setFanOpen] = useState(false);

  // Slot layout: 4 items with a spacer for the FAB in the middle
  //   [ H ][ E ]  ( FAB )  [ C ][ P ]
  const slotCount = NAV_ITEMS.length + 1; // + 1 for center slot
  const slotW = dockW / slotCount;

  // Map "active" (0..3) to a slot index skipping the FAB slot (index 2)
  const slotIndexOf = (i: number) => (i >= 2 ? i + 1 : i);

  // Indicator position
  const indicator = useSharedValue(0);
  useEffect(() => {
    if (!slotW) return;
    indicator.value = withSpring(slotIndexOf(active) * slotW, {
      damping: 18,
      stiffness: 180,
    });
  }, [active, slotW, indicator]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicator.value }],
    width: slotW,
  }));

  // FAB spin + fan progress
  const fan = useSharedValue(0);
  useEffect(() => {
    fan.value = withSpring(fanOpen ? 1 : 0, { damping: 15, stiffness: 160 });
  }, [fanOpen, fan]);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(fan.value, [0, 1], [0, 45])}deg` },
      { scale: interpolate(fan.value, [0, 1], [1, 1.06]) },
    ],
  }));
  const fabGlow = useAnimatedStyle(() => ({
    opacity: interpolate(fan.value, [0, 1], [0, 0.55]),
    transform: [{ scale: interpolate(fan.value, [0, 1], [0.6, 1.4]) }],
  }));
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(fan.value, [0, 1], [0, 1]),
    pointerEvents: fan.value > 0.02 ? ("auto" as any) : ("none" as any),
  }));

  const pickTab = (i: number) => {
    buzz();
    setActive(i);
    if (fanOpen) setFanOpen(false);
  };
  const toggleFan = () => {
    buzz("medium");
    setFanOpen((v) => !v);
  };
  const pickFanAction = (_key: string) => {
    buzz("medium");
    setFanOpen(false);
  };

  return (
    <>
      {/* Scrim behind fan */}
      <Animated.View
        pointerEvents={fanOpen ? "auto" : "none"}
        style={[styles.fanScrim, scrimStyle]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setFanOpen(false)} />
      </Animated.View>

      {/* Radial fan of quick actions (positioned above FAB) */}
      <View
        pointerEvents={fanOpen ? "box-none" : "none"}
        style={[styles.fanWrap, { bottom: 30 + Math.max(insets.bottom, 12) + 34 }]}
        testID="fab-fan"
      >
        {FAB_ACTIONS.map((a, i) => (
          <FanBubble
            key={a.key}
            index={i}
            total={FAB_ACTIONS.length}
            progress={fan}
            action={a}
            onPress={() => pickFanAction(a.key)}
          />
        ))}
      </View>

      {/* Dock */}
      <View
        style={[styles.dockWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
        pointerEvents="box-none"
        testID="creative-bottom-nav"
      >
        <View
          style={styles.dock}
          onLayout={(e) => setDockW(e.nativeEvent.layout.width)}
        >
          {/* Sliding lime capsule indicator */}
          {dockW > 0 && (
            <Animated.View style={[styles.indicator, indicatorStyle]}>
              <View style={styles.indicatorPill} />
              <View style={styles.indicatorDot} />
            </Animated.View>
          )}

          {/* Icons (with FAB slot in middle) */}
          <View style={styles.dockRow}>
            {[0, 1].map((i) => (
              <NavIcon
                key={NAV_ITEMS[i].key}
                item={NAV_ITEMS[i]}
                active={active === i}
                onPress={() => pickTab(i)}
              />
            ))}
            {/* FAB slot spacer */}
            <View style={styles.fabSlot} />
            {[2, 3].map((i) => (
              <NavIcon
                key={NAV_ITEMS[i].key}
                item={NAV_ITEMS[i]}
                active={active === i}
                onPress={() => pickTab(i)}
              />
            ))}
          </View>
        </View>

        {/* Center raised FAB */}
        <View style={styles.fabHolder} pointerEvents="box-none">
          <Animated.View style={[styles.fabGlow, fabGlow]} />
          <AnimatedPressable
            onPress={toggleFan}
            onLongPress={() => {
              buzz("medium");
              setFanOpen(true);
            }}
            style={[styles.fab, fabStyle]}
            testID="fab"
          >
            <View style={styles.fabInner}>
              <Ionicons name="add" size={30} color={C.ink} />
            </View>
            <View style={styles.fabRing} />
          </AnimatedPressable>
        </View>
      </View>
    </>
  );
}

// Individual nav icon with bloom + lift animation
function NavIcon({
  item,
  active,
  onPress,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onPress: () => void;
}) {
  const a = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    a.value = withSpring(active ? 1 : 0, { damping: 16, stiffness: 220 });
  }, [active, a]);
  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(a.value, [0, 1], [0, -6]) },
      { scale: interpolate(a.value, [0, 1], [1, 1.12]) },
    ],
  }));
  const bloom = useAnimatedStyle(() => ({
    opacity: interpolate(a.value, [0, 1], [0, 0.85]),
    transform: [{ scale: interpolate(a.value, [0, 1], [0.4, 1]) }],
  }));
  const label = useAnimatedStyle(() => ({
    opacity: interpolate(a.value, [0, 1], [0, 1]),
    transform: [{ translateY: interpolate(a.value, [0, 1], [4, 0]) }],
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.navBtn}
      testID={`nav-${item.key}`}
    >
      <Animated.View style={[styles.navBloom, bloom]} />
      <Animated.View style={iconStyle}>
        <Ionicons
          name={active ? item.icon : item.iconOutline}
          size={22}
          color={active ? C.ink : C.mute}
        />
      </Animated.View>
      <Animated.Text style={[styles.navLabel, label]}>{item.label}</Animated.Text>
    </Pressable>
  );
}

// One bubble in the FAB fan
function FanBubble({
  index,
  total,
  progress,
  action,
  onPress,
}: {
  index: number;
  total: number;
  progress: Animated.SharedValue<number>;
  action: (typeof FAB_ACTIONS)[number];
  onPress: () => void;
}) {
  // Fan icons arranged in an arc above the FAB
  // Spread from -60° to +60°, evenly divided
  const spread = 130;
  const startDeg = -spread / 2;
  const stepDeg = spread / (total - 1);
  const angleDeg = startDeg + index * stepDeg;
  const radius = 96;
  const rad = (angleDeg * Math.PI) / 180;
  const targetX = Math.sin(rad) * radius;
  const targetY = -Math.cos(rad) * radius;

  const anim = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4, 1], [0, 0, 1]),
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [0, targetX]) },
      { translateY: interpolate(progress.value, [0, 1], [0, targetY]) },
      { scale: interpolate(progress.value, [0, 0.5, 1], [0.4, 0.7, 1]) },
    ],
  }));

  const labelAnim = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.6, 1], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.fanItem, anim]}
      testID={`fan-${action.key}`}
    >
      <View style={[styles.fanBubble, { backgroundColor: action.color }]}>
        <Ionicons name={action.icon} size={20} color={C.ink} />
      </View>
      <Animated.Text style={[styles.fanLabel, labelAnim]}>
        {action.label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

// --------------------------------------------------------------------------
// Screen
// --------------------------------------------------------------------------
export default function Dashboard() {
  return (
    <SafeAreaView edges={["left", "right"]} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AmbientBackdrop />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        testID="dashboard-scroll"
      >
        <View style={{ height: 20 }} />
        <Header />
        <View style={{ height: 20 }} />

        <View style={styles.pageBlock}>
          <HeroCard />
        </View>

        {/* Section heading */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ QUICK ACTIONS</Text>
            <Text style={styles.sectionTitle}>Jump in</Text>
          </View>
          <Text style={styles.sectionHint}>tap  ·  hold  ·  swipe</Text>
        </View>

        <View style={styles.pageBlock}>
          <QuickActions />
        </View>

        {/* Nav explainer chip */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(360)}
          style={styles.navHint}
          testID="nav-hint"
        >
          <View style={styles.navHintDot} />
          <Text style={styles.navHintText}>
            Long-press the <Text style={styles.navHintKey}>+</Text> to open the radial menu
          </Text>
        </Animated.View>

        <View style={{ height: 200 }} />
      </Animated.ScrollView>

      {/* The show-stopper */}
      <CreativeBottomNav />
    </SafeAreaView>
  );
}

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingBottom: 40 },
  pageBlock: { paddingHorizontal: 20 },

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

  // Header
  header: { paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  avatarLg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.ink,
  },
  avatarText: { fontSize: 18, fontWeight: "900", color: C.ink },
  avatarStatus: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.lime,
    borderWidth: 2,
    borderColor: C.bg,
  },
  headerHello: {
    fontSize: 11,
    color: C.mute,
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.5,
    marginTop: 1,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.glassStrong,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.hair,
  },
  headerIconDot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.lime,
    borderWidth: 1.5,
    borderColor: C.ink,
  },

  // Hero
  heroCard: {
    marginTop: 4,
    height: 340,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: C.ink,
  },
  heroImgWrap: { flex: 1 },
  heroTicker: {
    position: "absolute",
    top: 18,
    right: -30,
    transform: [{ rotate: "90deg" }],
    opacity: 0.6,
  },
  heroTickerText: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 6,
    fontWeight: "800",
  },
  heroTopRow: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  limeSquare: { width: 8, height: 8, backgroundColor: C.lime, borderRadius: 2 },
  heroBadgeText: {
    color: C.white,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "800",
  },
  heroCountdown: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.lime,
  },
  heroCountdownText: {
    fontSize: 12,
    color: C.ink,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  heroBottom: {
    position: "absolute",
    bottom: 18,
    left: 18,
    right: 18,
  },
  heroKicker: {
    color: C.lime,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "800",
    marginBottom: 6,
  },
  heroTitle: {
    color: C.white,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  heroMetaRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  heroMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroMetaText: { color: C.white, fontSize: 11, fontWeight: "700" },

  // Section
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionKicker: {
    color: C.limeDeep,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "900",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.8,
  },
  sectionHint: {
    fontSize: 10,
    color: C.mute,
    letterSpacing: 2,
    fontWeight: "800",
  },

  // Quick actions
  quickWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: (SCREEN_W - 20 * 2 - 12) / 2,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: C.hair,
    shadowColor: C.ink,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  quickLabel: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  quickSub: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },

  // Nav hint
  navHint: {
    marginHorizontal: 20,
    marginTop: 32,
    padding: 14,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navHintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.lime,
    borderWidth: 1.5,
    borderColor: C.ink,
  },
  navHintText: { flex: 1, fontSize: 12, color: C.inkSoft, fontWeight: "700" },
  navHintKey: {
    fontSize: 14,
    fontWeight: "900",
    color: C.limeDeep,
  },

  // ---------- BOTTOM NAV ----------
  dockWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    paddingHorizontal: 18,
  },
  dock: {
    width: "100%",
    height: 68,
    borderRadius: 34,
    backgroundColor: C.ink,
    overflow: "hidden",
    shadowColor: C.ink,
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 24,
  },
  indicator: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 6,
  },
  indicatorPill: {
    width: "72%",
    height: 56,
    borderRadius: 22,
    backgroundColor: C.lime,
    marginBottom: -50,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.ink,
    marginBottom: 8,
  },
  dockRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  navBtn: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 4,
  },
  navBloom: {
    position: "absolute",
    top: 6,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.lime,
    opacity: 0,
  },
  navLabel: {
    marginTop: 3,
    fontSize: 9,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: 0.6,
  },
  fabSlot: {
    flex: 1,
    height: "100%",
  },

  // FAB
  fabHolder: {
    position: "absolute",
    top: -26,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  fabGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.lime,
    opacity: 0,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.lime,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: C.limeDeep,
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 20,
    borderWidth: 4,
    borderColor: C.bg,
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.lime,
    justifyContent: "center",
    alignItems: "center",
  },
  fabRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "rgba(10,10,10,0.15)",
  },

  // Fan
  fanScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,10,0.55)",
    zIndex: 3,
  },
  fanWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    height: 1,
    zIndex: 4,
  },
  fanItem: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  fanBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: C.ink,
    shadowColor: C.ink,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  fanLabel: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: "900",
    color: C.white,
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 6,
  },
});
