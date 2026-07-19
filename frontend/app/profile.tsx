import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

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
  star: "#FFB84D",
};

// --------------------------------------------------------------------------
// Data
// --------------------------------------------------------------------------
const HEALTH = {
  steps: 8420,
  stepsGoal: 10000,
  calories: 642,
  hr: 72,
  sleep: "7h 12m",
  week: [
    { d: "M", v: 0.62 },
    { d: "T", v: 0.85 },
    { d: "W", v: 0.44 },
    { d: "T", v: 0.92 },
    { d: "F", v: 0.71 },
    { d: "S", v: 0.98 },
    { d: "S", v: 0.5 },
  ],
};

const NEXT_SESSION = {
  trainer: "Aisha Verma",
  role: "Yoga · Mobility",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  when: "Today · 6:30 PM",
  countdown: "02 : 45 : 12",
  location: "Juhu Beach · Mumbai",
  session: "Sunset Vinyasa",
};

const UPDATES = [
  { id: "u1", kind: "STREAK", title: "12-day streak", sub: "Keep it up 🔥", color: "#DAFE4C", icon: "flame" as const },
  { id: "u2", kind: "PR", title: "New PR: 5K", sub: "22:14 · -0:38", color: "#FFC9A8", icon: "trophy" as const },
  { id: "u3", kind: "FOLLOW", title: "+3 followers", sub: "This week", color: "#BFE8FF", icon: "person-add" as const },
  { id: "u4", kind: "BADGE", title: "Early Bird", sub: "5 AM x 7", color: "#F4B0FF", icon: "star" as const },
];

const LAST_EVENT = {
  title: "Outdoor Sunset Yoga",
  tag: "YOGA",
  date: "Sun, 12 Jul  ·  6:00 PM",
  location: "Juhu Beach",
  image:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&q=80",
  duration: "58 min",
  cal: 312,
  bpm: 118,
  rating: 5,
};

const SAVED = [
  {
    id: "s1",
    name: "Neha K.",
    spec: "Vinyasa",
    price: 899,
    accent: "#DAFE4C",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  },
  {
    id: "s2",
    name: "Arjun M.",
    spec: "Strength",
    price: 1200,
    accent: "#FFC9A8",
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80",
  },
  {
    id: "s3",
    name: "Zara A.",
    spec: "Trail",
    price: 749,
    accent: "#BFE8FF",
    avatar:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80",
  },
  {
    id: "s4",
    name: "Kabir N.",
    spec: "HIIT",
    price: 950,
    accent: "#F4B0FF",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80",
  },
];

const HISTORY = [
  { id: "h1", date: "12 JUL", title: "Sunset Vinyasa", coach: "Aisha Verma", dur: "58m", cal: 312, tag: "YOGA" },
  { id: "h2", date: "10 JUL", title: "Deadlift PR Day", coach: "Arjun Mehta", dur: "72m", cal: 486, tag: "LIFT" },
  { id: "h3", date: "08 JUL", title: "Marine 5K Loop", coach: "Zara Ali", dur: "31m", cal: 402, tag: "RUN" },
  { id: "h4", date: "06 JUL", title: "HIIT Blast", coach: "Kabir Nair", dur: "42m", cal: 508, tag: "HIIT" },
];

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const buzz = () => {
  if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
};

// --------------------------------------------------------------------------
// Backdrop
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

function PulseDot({ color = C.lime }: { color?: string }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1400 }), -1, false);
  }, [p]);
  const ring = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 1], [0.6, 0]),
    transform: [{ scale: interpolate(p.value, [0, 1], [1, 2.6]) }],
  }));
  return (
    <View style={styles.dotWrap}>
      <Animated.View style={[styles.dotRing, { backgroundColor: color }, ring]} />
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

// --------------------------------------------------------------------------
// Steps ring (pure-View circular progress using two rotating halves)
// --------------------------------------------------------------------------
function ProgressRing({
  size = 96,
  stroke = 10,
  progress = 0.84,
  track = "rgba(255,255,255,0.14)",
  fill = C.lime,
  children,
}: {
  size?: number;
  stroke?: number;
  progress?: number;
  track?: string;
  fill?: string;
  children?: React.ReactNode;
}) {
  const clamped = Math.max(0, Math.min(0.999, progress));
  const half1Deg = clamped <= 0.5 ? clamped * 360 : 180;
  const half2Deg = clamped > 0.5 ? (clamped - 0.5) * 360 : 0;

  const ringStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: stroke,
    borderColor: track,
  } as const;
  const halfBase = {
    position: "absolute" as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: stroke,
    borderColor: "transparent",
    borderTopColor: fill,
    borderRightColor: fill,
  };

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View style={ringStyle} />
      <View
        style={[
          halfBase,
          { transform: [{ rotate: "-45deg" }, { rotate: `${half1Deg}deg` }] },
        ]}
      />
      {clamped > 0.5 && (
        <View
          style={[
            halfBase,
            { transform: [{ rotate: "-45deg" }, { rotate: `${180 + half2Deg}deg` }] },
          ]}
        />
      )}
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        {children}
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Header
// --------------------------------------------------------------------------
function Header({ scrollY }: { scrollY: Animated.SharedValue<number> }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const glass = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]} testID="profile-header">
      <Animated.View style={[StyleSheet.absoluteFill, glass]}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.headerHair} />
      </Animated.View>
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} testID="back-btn">
          <Feather name="arrow-left" size={18} color={C.lime} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerHello}>Signed in</Text>
          <Text style={styles.headerTitle}>Your Space</Text>
        </View>
        <Pressable style={styles.headerIcon} testID="share-btn">
          <Ionicons name="share-outline" size={18} color={C.ink} />
        </Pressable>
        <Pressable style={[styles.headerIcon, { marginLeft: 10 }]} testID="settings-btn">
          <Ionicons name="settings-outline" size={18} color={C.ink} />
        </Pressable>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Profile Hero (editorial + big stroked backdrop)
// --------------------------------------------------------------------------
function ProfileHero() {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.heroCard} testID="profile-hero">
      {/* Giant brutalist backdrop text */}
      <Text style={styles.bigP} pointerEvents="none">
        P
      </Text>

      <View style={styles.heroCardTop}>
        <View style={styles.avatarWrap}>
          <LinearGradient colors={[C.lime, "#F0FF7E"]} style={StyleSheet.absoluteFill} />
          <Text style={styles.avatarText}>P</Text>
          <View style={styles.avatarStatus} />
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>Priya Menon</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color={C.lime} />
            </View>
          </View>
          <Text style={styles.handle}>@priya.moves  ·  Mumbai</Text>
          <Text style={styles.bio}>
            Runner. Yogi. Chai enthusiast. Chasing sunrises since &apos;22.
          </Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.heroStats}>
        <View style={styles.heroStatItem}>
          <Text style={styles.heroStatNum}>Lv 07</Text>
          <Text style={styles.heroStatLbl}>Athlete</Text>
        </View>
        <View style={styles.heroStatDiv} />
        <View style={styles.heroStatItem}>
          <Text style={styles.heroStatNum}>12</Text>
          <Text style={styles.heroStatLbl}>day streak</Text>
        </View>
        <View style={styles.heroStatDiv} />
        <View style={styles.heroStatItem}>
          <Text style={styles.heroStatNum}>2,840</Text>
          <Text style={styles.heroStatLbl}>XP</Text>
        </View>
        <Pressable style={styles.heroEditBtn} onPress={buzz} testID="edit-profile">
          <Feather name="edit-3" size={14} color={C.lime} />
          <Text style={styles.heroEditText}>Edit</Text>
        </Pressable>
      </View>

      {/* Level progress bar */}
      <View style={styles.lvBar}>
        <View style={[styles.lvFill, { width: "68%" }]} />
        <Text style={styles.lvText}>320 XP to Level 08</Text>
      </View>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Total Bookings summary strip
// --------------------------------------------------------------------------
function BookingsStrip() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(120)}
      style={styles.statStrip}
      testID="bookings-strip"
    >
      <View style={styles.statItem}>
        <Text style={styles.statNum}>48</Text>
        <Text style={styles.statLbl}>bookings</Text>
      </View>
      <View style={styles.statDiv} />
      <View style={styles.statItem}>
        <Text style={styles.statNum}>32h</Text>
        <Text style={styles.statLbl}>trained</Text>
      </View>
      <View style={styles.statDiv} />
      <View style={styles.statItem}>
        <Text style={styles.statNum}>7</Text>
        <Text style={styles.statLbl}>badges</Text>
      </View>
      <View style={styles.statDiv} />
      <View style={styles.statItem}>
        <Text style={[styles.statNum, { color: C.limeDeep }]}>◉ 3</Text>
        <Text style={styles.statLbl}>upcoming</Text>
      </View>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Health Snapshot (ring + mini bars + micro stats)
// --------------------------------------------------------------------------
function HealthSnapshot() {
  const progress = HEALTH.steps / HEALTH.stepsGoal;
  return (
    <Animated.View
      entering={FadeInDown.duration(450).delay(180)}
      style={styles.health}
      testID="health-snapshot"
    >
      <View style={styles.healthHead}>
        <View>
          <Text style={styles.sectionKicker}>◇ TODAY</Text>
          <Text style={styles.healthTitle}>Health Snapshot</Text>
        </View>
        <View style={styles.healthLive}>
          <PulseDot />
          <Text style={styles.healthLiveText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.healthBody}>
        <View style={styles.ringCol}>
          <ProgressRing size={110} stroke={10} progress={progress}>
            <Text style={styles.ringNum}>
              {(HEALTH.steps / 1000).toFixed(1)}
              <Text style={styles.ringNumUnit}>k</Text>
            </Text>
            <Text style={styles.ringLbl}>STEPS</Text>
          </ProgressRing>
          <Text style={styles.ringGoal}>
            {Math.round(progress * 100)}% of {HEALTH.stepsGoal / 1000}k goal
          </Text>
        </View>

        <View style={styles.healthRight}>
          <View style={styles.microTile}>
            <View style={styles.microTileHead}>
              <Ionicons name="flame-outline" size={13} color={C.lime} />
              <Text style={styles.microTileLbl}>KCAL</Text>
            </View>
            <Text style={styles.microTileNum}>{HEALTH.calories}</Text>
          </View>
          <View style={styles.microTile}>
            <View style={styles.microTileHead}>
              <Ionicons name="heart-outline" size={13} color={C.lime} />
              <Text style={styles.microTileLbl}>BPM</Text>
            </View>
            <Text style={styles.microTileNum}>{HEALTH.hr}</Text>
          </View>
          <View style={styles.microTile}>
            <View style={styles.microTileHead}>
              <Ionicons name="moon-outline" size={13} color={C.lime} />
              <Text style={styles.microTileLbl}>SLEEP</Text>
            </View>
            <Text style={styles.microTileNum}>{HEALTH.sleep}</Text>
          </View>
        </View>
      </View>

      {/* Weekly bars */}
      <View style={styles.weekWrap}>
        {HEALTH.week.map((d, i) => (
          <View key={i} style={styles.weekCol}>
            <View style={styles.weekBarTrack}>
              <View style={[styles.weekBarFill, { height: `${d.v * 100}%` }]} />
            </View>
            <Text style={styles.weekDay}>{d.d}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Next Session (parallax-ish featured card)
// --------------------------------------------------------------------------
function NextSession() {
  const s = useSharedValue(1);
  const pressed = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      entering={FadeInDown.duration(500).delay(240)}
      onPressIn={() => (s.value = withSpring(0.98))}
      onPressOut={() => (s.value = withSpring(1))}
      onPress={buzz}
      style={[styles.nextCard, pressed]}
      testID="next-session"
    >
      <View style={styles.nextTicker}>
        <Text style={styles.nextTickerText}>◇ NEXT UP  ◇ NEXT UP</Text>
      </View>

      <View style={styles.nextTop}>
        <Text style={styles.nextKicker}>NEXT SESSION</Text>
        <View style={styles.nextCountdown}>
          <Text style={styles.nextCountdownText}>{NEXT_SESSION.countdown}</Text>
          <Text style={styles.nextCountdownLbl}>H : M : S</Text>
        </View>
      </View>

      <Text style={styles.nextTitle}>{NEXT_SESSION.session}</Text>

      <View style={styles.nextTrainerRow}>
        <View style={styles.nextAvatar}>
          <Image source={NEXT_SESSION.avatar} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.nextTrainerName}>{NEXT_SESSION.trainer}</Text>
          <Text style={styles.nextTrainerRole}>{NEXT_SESSION.role}</Text>
        </View>
        <Pressable style={styles.nextMsgBtn} onPress={buzz} testID="msg-trainer">
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={C.lime} />
        </Pressable>
      </View>

      <View style={styles.nextMetaRow}>
        <View style={styles.nextMetaChip}>
          <Ionicons name="time-outline" size={12} color={C.white} />
          <Text style={styles.nextMetaText}>{NEXT_SESSION.when}</Text>
        </View>
        <View style={styles.nextMetaChip}>
          <Ionicons name="location-outline" size={12} color={C.white} />
          <Text style={styles.nextMetaText}>{NEXT_SESSION.location}</Text>
        </View>
      </View>

      <Pressable style={styles.readyBtn} onPress={buzz} testID="ready-btn">
        <Text style={styles.readyBtnText}>I&apos;m Ready</Text>
        <View style={styles.readyBtnArrow}>
          <Feather name="arrow-up-right" size={18} color={C.ink} />
        </View>
      </Pressable>
    </AnimatedPressable>
  );
}

// --------------------------------------------------------------------------
// Today's Updates rail
// --------------------------------------------------------------------------
function UpdatesRail() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.updatesRail}
      testID="updates-rail"
    >
      {UPDATES.map((u, i) => (
        <AnimatedPressable
          key={u.id}
          entering={FadeInDown.duration(400).delay(80 * i)}
          onPress={buzz}
          style={styles.updateCard}
          testID={`update-${u.id}`}
        >
          <View style={[styles.updateIcon, { backgroundColor: u.color }]}>
            <Ionicons name={u.icon} size={16} color={C.ink} />
          </View>
          <Text style={styles.updateKind}>{u.kind}</Text>
          <Text style={styles.updateTitle}>{u.title}</Text>
          <Text style={styles.updateSub}>{u.sub}</Text>
        </AnimatedPressable>
      ))}
    </ScrollView>
  );
}

// --------------------------------------------------------------------------
// Last Event Recap
// --------------------------------------------------------------------------
function LastEventRecap() {
  const s = useSharedValue(1);
  const pressed = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      entering={FadeInDown.duration(500).delay(200)}
      onPressIn={() => (s.value = withSpring(0.98))}
      onPressOut={() => (s.value = withSpring(1))}
      onPress={buzz}
      style={[styles.recap, pressed]}
      testID="last-event"
    >
      <View style={styles.recapImgWrap}>
        <Image
          source={LAST_EVENT.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.15)", "rgba(0,0,0,0.75)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Tag */}
        <View style={styles.recapTag}>
          <View style={styles.recapTagDot} />
          <Text style={styles.recapTagText}>{LAST_EVENT.tag}</Text>
        </View>
        {/* Stars */}
        <View style={styles.recapStars}>
          {Array.from({ length: LAST_EVENT.rating }).map((_, i) => (
            <Ionicons key={i} name="star" size={11} color={C.star} />
          ))}
          <Text style={styles.recapStarsText}>you rated</Text>
        </View>

        <View style={styles.recapBottom}>
          <Text style={styles.recapKicker}>LAST EVENT</Text>
          <Text style={styles.recapTitle} numberOfLines={1}>
            {LAST_EVENT.title}
          </Text>
          <Text style={styles.recapMeta}>
            {LAST_EVENT.date}  ·  {LAST_EVENT.location}
          </Text>
        </View>
      </View>

      {/* Recap stats footer */}
      <View style={styles.recapStats}>
        <View style={styles.recapStat}>
          <Text style={styles.recapStatNum}>{LAST_EVENT.duration}</Text>
          <Text style={styles.recapStatLbl}>duration</Text>
        </View>
        <View style={styles.recapStatDiv} />
        <View style={styles.recapStat}>
          <Text style={styles.recapStatNum}>{LAST_EVENT.cal}</Text>
          <Text style={styles.recapStatLbl}>kcal</Text>
        </View>
        <View style={styles.recapStatDiv} />
        <View style={styles.recapStat}>
          <Text style={styles.recapStatNum}>{LAST_EVENT.bpm}</Text>
          <Text style={styles.recapStatLbl}>avg bpm</Text>
        </View>
        <Pressable style={styles.recapCta} onPress={buzz} testID="view-recap">
          <Feather name="arrow-up-right" size={16} color={C.lime} />
        </Pressable>
      </View>
    </AnimatedPressable>
  );
}

// --------------------------------------------------------------------------
// Saved trainers rail
// --------------------------------------------------------------------------
function SavedRail() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.savedRail}
      testID="saved-rail"
    >
      {SAVED.map((s, i) => (
        <AnimatedPressable
          key={s.id}
          entering={FadeInDown.duration(400).delay(60 * i)}
          onPress={buzz}
          style={styles.savedCard}
          testID={`saved-${s.id}`}
        >
          <View style={[styles.savedAvatar, { backgroundColor: s.accent }]}>
            <Image source={s.avatar} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.savedName}>{s.name}</Text>
            <Text style={styles.savedSpec}>{s.spec}</Text>
            <Text style={styles.savedPrice}>
              ₹ {s.price}
              <Text style={styles.savedPriceUnit}> /sess</Text>
            </Text>
          </View>
          <View style={styles.savedHeart}>
            <Ionicons name="heart" size={12} color={C.lime} />
          </View>
        </AnimatedPressable>
      ))}
    </ScrollView>
  );
}

// --------------------------------------------------------------------------
// History timeline
// --------------------------------------------------------------------------
function HistoryTimeline() {
  return (
    <View style={styles.history} testID="history">
      {HISTORY.map((h, i) => (
        <Animated.View
          key={h.id}
          entering={FadeInDown.duration(400).delay(80 * i)}
          style={styles.histRow}
        >
          {/* Timeline dot + line */}
          <View style={styles.histTimeline}>
            <View style={styles.histDot} />
            {i < HISTORY.length - 1 && <View style={styles.histLine} />}
          </View>

          <View style={styles.histCard}>
            <View style={styles.histCardTop}>
              <Text style={styles.histDate}>{h.date}</Text>
              <View style={styles.histTag}>
                <Text style={styles.histTagText}>{h.tag}</Text>
              </View>
            </View>
            <Text style={styles.histTitle}>{h.title}</Text>
            <Text style={styles.histCoach}>with {h.coach}</Text>
            <View style={styles.histFooter}>
              <View style={styles.histMeta}>
                <Ionicons name="time-outline" size={12} color={C.mute} />
                <Text style={styles.histMetaText}>{h.dur}</Text>
              </View>
              <View style={styles.histMeta}>
                <Ionicons name="flame-outline" size={12} color={C.mute} />
                <Text style={styles.histMetaText}>{h.cal} kcal</Text>
              </View>
              <Pressable style={styles.histReplayBtn} onPress={buzz} testID={`replay-${h.id}`}>
                <Feather name="rotate-cw" size={11} color={C.lime} />
                <Text style={styles.histReplayText}>Book again</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

// --------------------------------------------------------------------------
// Bottom nav
// --------------------------------------------------------------------------
const NAV = [
  { key: "home", route: "/", icon: "home-outline" as const, label: "Home" },
  { key: "sessions", route: "/", icon: "calendar-outline" as const, label: "Sessions" },
  { key: "coaches", route: "/trainers", icon: "compass-outline" as const, label: "Coaches" },
  { key: "community", route: "/community", icon: "people-outline" as const, label: "Community" },
  { key: "profile", route: "/profile", icon: "person-outline" as const, label: "Profile", active: true },
];

function BottomNav() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View
      pointerEvents="box-none"
      style={[styles.navWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
      testID="bottom-nav"
    >
      <BlurView intensity={60} tint="light" style={styles.nav}>
        <View style={styles.navInner}>
          {NAV.map((n) => {
            const active = !!n.active;
            return (
              <Pressable
                key={n.key}
                onPress={() => {
                  buzz();
                  if (!active) router.push(n.route as any);
                }}
                style={[styles.navItem, active && styles.navItemActive]}
                testID={`nav-${n.key}`}
              >
                <Ionicons name={n.icon} size={20} color={active ? C.ink : C.mute} />
                {active && <Text style={styles.navLabel}>{n.label}</Text>}
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

// --------------------------------------------------------------------------
// Screen
// --------------------------------------------------------------------------
export default function ProfileScreen() {
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AmbientBackdrop />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        testID="profile-scroll"
      >
        <View style={{ height: 96 }} />

        <View style={styles.pageBlock}>
          <ProfileHero />
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 14 }}>
          <BookingsStrip />
        </View>

        {/* Next Session */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ ON THE CLOCK</Text>
            <Text style={styles.sectionTitle}>Next Session</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <NextSession />
        </View>

        {/* Health */}
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <HealthSnapshot />
        </View>

        {/* Today Updates */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ TODAY</Text>
            <Text style={styles.sectionTitle}>Updates</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="see-all-updates">
            <Text style={styles.sectionBtnText}>All</Text>
            <Feather name="arrow-right" size={14} color={C.ink} />
          </Pressable>
        </View>
        <UpdatesRail />

        {/* Last event */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ REPLAY</Text>
            <Text style={styles.sectionTitle}>Last Event</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <LastEventRecap />
        </View>

        {/* Saved trainers */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ FAVORITES</Text>
            <Text style={styles.sectionTitle}>Saved Coaches</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="see-all-saved">
            <Text style={styles.sectionBtnText}>Manage</Text>
            <Feather name="arrow-right" size={14} color={C.ink} />
          </Pressable>
        </View>
        <SavedRail />

        {/* History */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ TIMELINE</Text>
            <Text style={styles.sectionTitle}>History</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="filter-history">
            <Ionicons name="filter" size={13} color={C.ink} />
            <Text style={styles.sectionBtnText}>Filter</Text>
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <HistoryTimeline />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>◇ member since Jan 2024 ◇</Text>
        </View>
        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      <Header scrollY={scrollY} />
      <BottomNav />
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
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerHair: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: C.hair,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
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

  // Pulse
  dotWrap: { width: 10, height: 10, justifyContent: "center", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotRing: { position: "absolute", width: 8, height: 8, borderRadius: 4 },

  // Profile hero
  heroCard: {
    marginTop: 4,
    borderRadius: 28,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    padding: 22,
    overflow: "hidden",
    shadowColor: C.ink,
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  bigP: {
    position: "absolute",
    right: -40,
    top: -50,
    fontSize: 280,
    fontWeight: "900",
    color: C.lime,
    opacity: 0.15,
    letterSpacing: -10,
  },
  heroCardTop: { flexDirection: "row", alignItems: "center" },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.ink,
  },
  avatarText: { fontSize: 32, fontWeight: "900", color: C.ink },
  avatarStatus: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.lime,
    borderWidth: 3,
    borderColor: C.white,
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 22, fontWeight: "900", color: C.ink, letterSpacing: -0.7 },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  handle: { fontSize: 12, color: C.mute, fontWeight: "700", marginTop: 2 },
  bio: { fontSize: 13, color: C.inkSoft, fontWeight: "600", marginTop: 8, lineHeight: 18 },

  heroStats: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.ink,
    borderRadius: 18,
    padding: 12,
  },
  heroStatItem: { flex: 1, alignItems: "center" },
  heroStatNum: { color: C.white, fontSize: 14, fontWeight: "900", letterSpacing: -0.3 },
  heroStatLbl: { color: "rgba(255,255,255,0.55)", fontSize: 9, letterSpacing: 1.2, fontWeight: "700", marginTop: 2 },
  heroStatDiv: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.14)" },
  heroEditBtn: {
    marginLeft: 6,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: C.inkSoft,
    borderWidth: 1,
    borderColor: C.lime,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroEditText: { color: C.lime, fontSize: 11, fontWeight: "900" },

  lvBar: {
    marginTop: 14,
    height: 32,
    borderRadius: 12,
    backgroundColor: C.bgSoft,
    justifyContent: "center",
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  lvFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: C.lime,
  },
  lvText: { fontSize: 11, fontWeight: "900", color: C.ink, letterSpacing: -0.2 },

  // Stat strip
  statStrip: {
    height: 68,
    borderRadius: 22,
    backgroundColor: C.ink,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  statItem: { flex: 1, justifyContent: "center", alignItems: "center" },
  statNum: { color: C.white, fontSize: 16, fontWeight: "900", letterSpacing: -0.4 },
  statLbl: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: "700",
    marginTop: 2,
  },
  statDiv: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.14)" },

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
  sectionBtn: {
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
  sectionBtnText: { fontSize: 12, fontWeight: "800", color: C.ink },

  // Next session
  nextCard: {
    borderRadius: 28,
    backgroundColor: C.ink,
    padding: 22,
    overflow: "hidden",
  },
  nextTicker: {
    position: "absolute",
    top: 18,
    right: -32,
    transform: [{ rotate: "90deg" }],
    opacity: 0.55,
  },
  nextTickerText: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 6,
    fontWeight: "800",
  },
  nextTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  nextKicker: {
    color: C.lime,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "900",
  },
  nextCountdown: {
    alignItems: "flex-end",
  },
  nextCountdownText: {
    color: C.lime,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },
  nextCountdownLbl: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "800",
    marginTop: 2,
  },
  nextTitle: {
    color: C.white,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 12,
    lineHeight: 32,
  },
  nextTrainerRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  nextAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: C.lime,
  },
  nextTrainerName: {
    color: C.white,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  nextTrainerRole: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  nextMsgBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(218,254,76,0.15)",
    borderWidth: 1,
    borderColor: C.lime,
    justifyContent: "center",
    alignItems: "center",
  },
  nextMetaRow: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" },
  nextMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  nextMetaText: { color: C.white, fontSize: 11, fontWeight: "700" },
  readyBtn: {
    marginTop: 16,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.lime,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 22,
    paddingRight: 6,
  },
  readyBtnText: { color: C.ink, fontSize: 16, fontWeight: "900", letterSpacing: -0.3 },
  readyBtnArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },

  // Health
  health: {
    borderRadius: 26,
    backgroundColor: C.ink,
    padding: 20,
  },
  healthHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  healthTitle: {
    color: C.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 2,
  },
  healthLive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(218,254,76,0.12)",
    borderWidth: 1,
    borderColor: C.lime,
  },
  healthLiveText: { color: C.lime, fontSize: 10, letterSpacing: 1.4, fontWeight: "900" },
  healthBody: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  ringCol: { alignItems: "center" },
  ringNum: {
    color: C.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  ringNumUnit: { color: C.lime, fontSize: 12, fontWeight: "900" },
  ringLbl: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: "800",
    marginTop: 2,
  },
  ringGoal: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
    width: 110,
  },
  healthRight: { flex: 1, marginLeft: 18, gap: 8 },
  microTile: {
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  microTileHead: { flexDirection: "row", alignItems: "center", gap: 5 },
  microTileLbl: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  microTileNum: { color: C.white, fontSize: 14, fontWeight: "900", letterSpacing: -0.3 },
  weekWrap: {
    marginTop: 18,
    height: 88,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  weekCol: {
    width: 34,
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  weekBarTrack: {
    width: 22,
    height: 68,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  weekBarFill: {
    width: "100%",
    backgroundColor: C.lime,
    borderRadius: 8,
  },
  weekDay: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 6,
    letterSpacing: 1,
  },

  // Updates rail
  updatesRail: { paddingHorizontal: 20, gap: 12 },
  updateCard: {
    width: 160,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    padding: 14,
  },
  updateIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  updateKind: {
    color: C.limeDeep,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  updateTitle: {
    color: C.ink,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 4,
  },
  updateSub: { color: C.mute, fontSize: 11, fontWeight: "700", marginTop: 4 },

  // Recap
  recap: {
    borderRadius: 26,
    backgroundColor: C.white,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.hair,
  },
  recapImgWrap: {
    height: 200,
    width: "100%",
    backgroundColor: "#111",
  },
  recapTag: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.lime,
  },
  recapTagDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.ink },
  recapTagText: {
    fontSize: 10,
    color: C.ink,
    fontWeight: "900",
    letterSpacing: 1,
  },
  recapStars: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  recapStarsText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 4,
  },
  recapBottom: {
    position: "absolute",
    bottom: 14,
    left: 14,
    right: 14,
  },
  recapKicker: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "900",
  },
  recapTitle: {
    color: C.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 3,
  },
  recapMeta: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  recapStats: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  recapStat: { flex: 1, alignItems: "center" },
  recapStatNum: {
    color: C.ink,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  recapStatLbl: {
    color: C.mute,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "800",
    marginTop: 2,
  },
  recapStatDiv: { width: 1, height: 26, backgroundColor: C.hair },
  recapCta: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },

  // Saved rail
  savedRail: { paddingHorizontal: 20, gap: 12 },
  savedCard: {
    width: 240,
    padding: 12,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    flexDirection: "row",
    alignItems: "center",
  },
  savedAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: "hidden",
  },
  savedName: {
    fontSize: 14,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
  },
  savedSpec: { fontSize: 11, color: C.mute, fontWeight: "700", marginTop: 2 },
  savedPrice: {
    fontSize: 12,
    fontWeight: "900",
    color: C.ink,
    marginTop: 3,
  },
  savedPriceUnit: { color: C.mute, fontWeight: "700", fontSize: 10 },
  savedHeart: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },

  // History
  history: { marginTop: 4 },
  histRow: { flexDirection: "row", paddingBottom: 14 },
  histTimeline: {
    width: 22,
    alignItems: "center",
    paddingTop: 6,
  },
  histDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.lime,
    borderWidth: 3,
    borderColor: C.ink,
  },
  histLine: {
    width: 2,
    flex: 1,
    backgroundColor: C.hair,
    marginTop: 4,
  },
  histCard: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    padding: 14,
  },
  histCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  histDate: {
    color: C.mute,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "900",
  },
  histTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: C.ink,
  },
  histTagText: { color: C.lime, fontSize: 9, letterSpacing: 1, fontWeight: "900" },
  histTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.4,
    marginTop: 6,
  },
  histCoach: { fontSize: 12, color: C.mute, fontWeight: "700", marginTop: 2 },
  histFooter: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  histMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  histMetaText: { fontSize: 11, color: C.mute, fontWeight: "800" },
  histReplayBtn: {
    marginLeft: "auto",
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: C.ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  histReplayText: {
    color: C.lime,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: -0.1,
  },

  // Footer
  footer: { marginTop: 22, alignItems: "center" },
  footerText: {
    fontSize: 11,
    color: C.mute,
    letterSpacing: 3,
    fontWeight: "700",
  },

  // Bottom nav
  navWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    alignItems: "center",
  },
  nav: {
    width: "100%",
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: C.hair,
  },
  navInner: {
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  navItem: {
    height: 48,
    minWidth: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    flex: 1,
  },
  navItemActive: { backgroundColor: C.lime, flexGrow: 1.6 },
  navLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.2,
  },
});
