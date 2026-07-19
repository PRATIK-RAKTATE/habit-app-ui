import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  StatusBar,
  Platform,
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
  withDelay,
  withSpring,
  Easing,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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

const HERO_H = 380;

// --------------------------------------------------------------------------
// Data
// --------------------------------------------------------------------------
const TABS = ["Discover", "Booked", "Hosted"] as const;
const CHIPS = [
  { label: "All", icon: "sparkles-outline" as const },
  { label: "Fitness", icon: "flame-outline" as const },
  { label: "Yoga", icon: "leaf-outline" as const },
  { label: "Strength", icon: "barbell-outline" as const },
  { label: "Running", icon: "walk-outline" as const },
  { label: "Cycling", icon: "bicycle-outline" as const },
];

const EVENTS = [
  {
    id: "1",
    title: "Midnight City Marathon",
    tag: "FITNESS",
    date: "Mon, 13 Jul  |  1:14 pm",
    location: "Marine Drive, Mumbai",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80",
    joined: 128,
    price: "Free",
    hostColors: ["#FFB4B4", "#A8D8FF", "#DAFE4C", "#EAD9FF"],
  },
  {
    id: "2",
    title: "HIIT & Core Blast",
    tag: "STRENGTH",
    date: "Wed, 15 Jul  |  6:30 am",
    location: "Bandra Fort, Mumbai",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80",
    joined: 72,
    price: "₹ 299",
    hostColors: ["#DAFE4C", "#FFC9A8", "#BFE8FF", "#F4B0FF"],
  },
  {
    id: "3",
    title: "Riverside Sunrise Vinyasa",
    tag: "YOGA",
    date: "Sat, 18 Jul  |  5:45 am",
    location: "Powai Lake, Mumbai",
    image:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
    joined: 214,
    price: "Free",
    hostColors: ["#B9FFE1", "#DAFE4C", "#FFD6A8", "#C9C0FF"],
  },
];

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const buzz = () => {
  if (Platform.OS !== "web") {
    Haptics.selectionAsync().catch(() => {});
  }
};

// --------------------------------------------------------------------------
// Background — floating lime orbs (glassmorphic atmosphere)
// --------------------------------------------------------------------------
function AmbientBackdrop() {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }), -1, true);
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
      <View style={styles.grain} />
    </View>
  );
}

// --------------------------------------------------------------------------
// Live pulse dot
// --------------------------------------------------------------------------
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
// Segmented Tabs
// --------------------------------------------------------------------------
function SegmentedTabs({
  value,
  onChange,
}: {
  value: number;
  onChange: (i: number) => void;
}) {
  const [width, setWidth] = useState(0);
  const seg = width / TABS.length;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withSpring(value * seg, { damping: 18, stiffness: 180 });
  }, [value, seg, x]);

  const pill = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: seg,
  }));

  return (
    <View
      style={styles.tabsWrap}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      testID="events-tabs"
    >
      <Animated.View style={[styles.tabPill, pill]}>
        <LinearGradient
          colors={[C.ink, "#242423"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {TABS.map((t, i) => (
        <Pressable
          key={t}
          onPress={() => {
            buzz();
            onChange(i);
          }}
          style={styles.tabItem}
          testID={`tab-${t.toLowerCase()}`}
        >
          <Text style={[styles.tabText, value === i && styles.tabTextActive]}>
            {t}
          </Text>
          {value === i && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.tabDot} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

// --------------------------------------------------------------------------
// Chip Row (horizontal scroll — chrome, not content)
// --------------------------------------------------------------------------
function Chips({
  value,
  onChange,
}: {
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
      testID="category-chips"
    >
      {CHIPS.map((c, i) => {
        const active = i === value;
        return (
          <Pressable
            key={c.label}
            onPress={() => {
              buzz();
              onChange(i);
            }}
            style={[styles.chip, active && styles.chipActive]}
            testID={`chip-${c.label.toLowerCase()}`}
          >
            <Ionicons
              name={c.icon}
              size={15}
              color={active ? C.ink : C.inkSoft}
            />
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {c.label}
            </Text>
            {active && <View style={styles.chipAccent} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// --------------------------------------------------------------------------
// Featured Hero — parallax + glass badge + morphing button
// --------------------------------------------------------------------------
function FeaturedHero({ scrollY }: { scrollY: Animated.SharedValue<number> }) {
  const imgStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-200, 0, 200],
          [-60, 0, 40],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-200, 0, 200],
          [1.25, 1.05, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(100)}
      style={styles.hero}
      testID="featured-event"
    >
      <Animated.View style={[StyleSheet.absoluteFill, imgStyle]}>
        <Image
          source="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&q=80"
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
        />
      </Animated.View>

      {/* darken bottom + top for text legibility */}
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0.75)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Corner brutalist ticker */}
      <View style={styles.heroTicker}>
        <Text style={styles.heroTickerText}>◇ FEATURED  ◇ FEATURED  ◇ FEATURED</Text>
      </View>

      {/* Top badge — glass */}
      <View style={styles.heroTop}>
        <BlurView intensity={40} tint="dark" style={styles.heroBadge}>
          <View style={styles.limeSquare} />
          <Text style={styles.heroBadgeText}>FEATURED · OUTDOOR</Text>
        </BlurView>

        <View style={styles.heroLive}>
          <PulseDot />
          <Text style={styles.heroLiveText}>LIVE SPOTS</Text>
        </View>
      </View>

      {/* Bottom content */}
      <View style={styles.heroBottom}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroKicker}>SUNDAY · JULY 13</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            Outdoor{"\n"}Sunset Yoga
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaChip}>
              <Ionicons name="time-outline" size={12} color={C.white} />
              <Text style={styles.heroMetaText}>1:14 pm</Text>
            </View>
            <View style={styles.heroMetaChip}>
              <Ionicons name="location-outline" size={12} color={C.white} />
              <Text style={styles.heroMetaText}>Juhu Beach</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={buzz}
          style={styles.joinBtn}
          testID="join-featured-event"
        >
          <View style={styles.joinBtnInner}>
            <Text style={styles.joinBtnText}>Join</Text>
            <View style={styles.joinBtnArrow}>
              <Feather name="arrow-up-right" size={18} color={C.lime} />
            </View>
          </View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Editorial Event Card (glass + brutalist numbering)
// --------------------------------------------------------------------------
function EventCard({
  event,
  index,
}: {
  event: (typeof EVENTS)[number];
  index: number;
}) {
  const scale = useSharedValue(1);
  const pressed = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.duration(520).delay(120 * index)}
      onPressIn={() => (scale.value = withSpring(0.98))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={buzz}
      style={[styles.card, pressed]}
      testID={`event-card-${event.id}`}
    >
      {/* Image with overlay tag */}
      <View style={styles.cardImgWrap}>
        <Image
          source={event.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.35)", "transparent", "rgba(0,0,0,0.35)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Brutalist index number */}
        <View style={styles.cardIndex}>
          <Text style={styles.cardIndexText}>
            {String(index + 1).padStart(2, "0")}
            <Text style={styles.cardIndexTotal}> / {String(EVENTS.length).padStart(2, "0")}</Text>
          </Text>
        </View>
        {/* Tag pill */}
        <View style={styles.cardTag}>
          <View style={styles.cardTagDot} />
          <Text style={styles.cardTagText}>{event.tag}</Text>
        </View>
        {/* Save icon */}
        <BlurView intensity={30} tint="light" style={styles.saveBtn}>
          <Ionicons name="bookmark-outline" size={16} color={C.white} />
        </BlurView>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {event.title}
        </Text>

        <View style={styles.cardMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={C.mute} />
            <Text style={styles.metaText}>{event.date}</Text>
          </View>
        </View>
        <View style={styles.cardMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={C.mute} />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
        </View>

        {/* Footer row: avatars + price + button */}
        <View style={styles.cardFooter}>
          <View style={styles.avatarsRow}>
            {event.hostColors.slice(0, 3).map((c, i) => (
              <View
                key={i}
                style={[
                  styles.avatar,
                  { backgroundColor: c, marginLeft: i === 0 ? 0 : -10 },
                ]}
              >
                <Text style={styles.avatarText}>
                  {["JD", "AN", "SH", "MK"][i]}
                </Text>
              </View>
            ))}
            <View style={[styles.avatar, styles.avatarMore]}>
              <Text style={styles.avatarMoreText}>+{event.joined - 3}</Text>
            </View>
          </View>

          <View style={styles.priceWrap}>
            <Text style={styles.priceText}>{event.price}</Text>
          </View>

          <Pressable style={styles.detailsBtn} onPress={buzz}>
            <Text style={styles.detailsBtnText}>Details</Text>
            <Feather name="arrow-right" size={14} color={C.lime} />
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// --------------------------------------------------------------------------
// Header (sticky, glass on scroll)
// --------------------------------------------------------------------------
function Header({ scrollY }: { scrollY: Animated.SharedValue<number> }) {
  const insets = useSafeAreaInsets();
  const glass = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]} testID="events-header">
      <Animated.View style={[StyleSheet.absoluteFill, glass]}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.headerHair} />
      </Animated.View>

      <View style={styles.headerRow}>
        <Pressable style={styles.avatarLg} testID="profile-avatar">
          <LinearGradient
            colors={[C.lime, "#F0FF7E"]}
            style={StyleSheet.absoluteFill}
          />
          <Text style={styles.avatarLgText}>P</Text>
          <View style={styles.avatarStatus} />
        </Pressable>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerHello}>Sunday, 13 July</Text>
          <Text style={styles.headerTitle}>Events</Text>
        </View>

        <Pressable style={styles.headerIcon} testID="notif-btn">
          <Ionicons name="notifications-outline" size={20} color={C.ink} />
          <View style={styles.headerIconDot} />
        </Pressable>
        <Pressable style={[styles.headerIcon, { marginLeft: 10 }]} testID="search-btn">
          <Ionicons name="search" size={20} color={C.ink} />
        </Pressable>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Bottom Nav (floating glass)
// --------------------------------------------------------------------------
const NAV = [
  { key: "home", icon: "home-outline" as const, label: "Home" },
  { key: "sessions", icon: "calendar-outline" as const, label: "Sessions", active: true },
  { key: "coaches", icon: "compass-outline" as const, label: "Coaches" },
  { key: "community", icon: "people-outline" as const, label: "Community" },
  { key: "profile", icon: "person-outline" as const, label: "Profile" },
];

function BottomNav() {
  const insets = useSafeAreaInsets();
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
                onPress={buzz}
                style={[styles.navItem, active && styles.navItemActive]}
                testID={`nav-${n.key}`}
              >
                <Ionicons
                  name={n.icon}
                  size={20}
                  color={active ? C.ink : C.mute}
                />
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
// Main Screen
// --------------------------------------------------------------------------
export default function EventsScreen() {
  const [tab, setTab] = useState(0);
  const [chip, setChip] = useState(0);
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
        testID="events-scroll"
      >
        {/* Top spacer for header */}
        <View style={{ height: 96 }} />

        {/* Segmented Tabs */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <SegmentedTabs value={tab} onChange={setTab} />
        </Animated.View>

        {/* Chips */}
        <Animated.View entering={FadeInDown.duration(400).delay(60)}>
          <Chips value={chip} onChange={setChip} />
        </Animated.View>

        {/* Featured Hero */}
        <FeaturedHero scrollY={scrollY} />

        {/* Stat strip */}
        <Animated.View
          entering={FadeInDown.duration(450).delay(220)}
          style={styles.statStrip}
          testID="stat-strip"
        >
          <View style={styles.statItem}>
            <Text style={styles.statNum}>48</Text>
            <Text style={styles.statLbl}>this week</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>1.2k</Text>
            <Text style={styles.statLbl}>joined</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.limeDeep }]}>◉ 3</Text>
            <Text style={styles.statLbl}>live now</Text>
          </View>
          <Pressable style={styles.statCta} onPress={buzz}>
            <Feather name="arrow-up-right" size={16} color={C.lime} />
          </Pressable>
        </Animated.View>

        {/* Upcoming header */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ NEXT UP</Text>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="see-all">
            <Text style={styles.sectionBtnText}>See all</Text>
            <Feather name="arrow-right" size={14} color={C.ink} />
          </Pressable>
        </View>

        {/* Cards */}
        <View style={{ paddingHorizontal: 20, gap: 18 }}>
          {EVENTS.map((e, i) => (
            <EventCard key={e.id} event={e} index={i} />
          ))}
        </View>

        {/* Footer flourish */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>◇ that&apos;s all — swipe to refresh ◇</Text>
        </View>

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Sticky Header (over scroll) */}
      <Header scrollY={scrollY} />

      {/* Floating Bottom Nav */}
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

  // Ambient
  orb: {
    position: "absolute",
    borderRadius: 400,
    backgroundColor: C.lime,
    opacity: 0.45,
  },
  orbTop: {
    width: 360,
    height: 360,
    top: -140,
    right: -120,
  },
  orbMid: {
    width: 300,
    height: 300,
    top: 380,
    left: -120,
    backgroundColor: "#FFE9A8",
    opacity: 0.35,
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bg,
    opacity: 0.6,
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
  avatarLgText: { fontSize: 18, fontWeight: "900", color: C.ink },
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
  headerHello: { fontSize: 11, color: C.mute, letterSpacing: 0.5, fontWeight: "600" },
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

  // Tabs
  tabsWrap: {
    marginHorizontal: 20,
    marginTop: 4,
    height: 56,
    borderRadius: 20,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.hair,
    padding: 6,
    flexDirection: "row",
    position: "relative",
  },
  tabPill: {
    position: "absolute",
    top: 6,
    left: 6,
    bottom: 6,
    borderRadius: 14,
    overflow: "hidden",
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    zIndex: 2,
  },
  tabText: { fontSize: 14, fontWeight: "700", color: C.mute, letterSpacing: -0.2 },
  tabTextActive: { color: C.lime },
  tabDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.lime,
  },

  // Chips
  chipRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
    alignItems: "center",
  },
  chip: {
    height: 36,
    flexShrink: 0,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: C.glassStrong,
    borderWidth: 1,
    borderColor: C.hair,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipActive: {
    backgroundColor: C.ink,
    borderColor: C.ink,
  },
  chipText: { fontSize: 13, fontWeight: "700", color: C.inkSoft, letterSpacing: -0.1 },
  chipTextActive: { color: C.lime },
  chipAccent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.lime,
    marginLeft: 2,
  },

  // Pulse
  dotWrap: { width: 10, height: 10, justifyContent: "center", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotRing: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Hero
  hero: {
    marginHorizontal: 20,
    marginTop: 4,
    height: HERO_H,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: C.ink,
  },
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
  heroTop: {
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
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: "hidden",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  limeSquare: {
    width: 8,
    height: 8,
    backgroundColor: C.lime,
    borderRadius: 2,
  },
  heroBadgeText: {
    color: C.white,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "800",
  },
  heroLive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroLiveText: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  heroBottom: {
    position: "absolute",
    bottom: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    alignItems: "flex-end",
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
  joinBtn: { marginLeft: 12 },
  joinBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.lime,
    paddingLeft: 18,
    paddingRight: 6,
    height: 52,
    borderRadius: 26,
    gap: 6,
  },
  joinBtnText: { fontSize: 15, fontWeight: "900", color: C.ink, letterSpacing: -0.2 },
  joinBtnArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },

  // Stat strip
  statStrip: {
    marginHorizontal: 20,
    marginTop: 18,
    height: 68,
    borderRadius: 22,
    backgroundColor: C.ink,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  statItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statNum: {
    color: C.white,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  statLbl: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "700",
    marginTop: 2,
  },
  statDiv: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  statCta: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.inkSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.lime,
  },

  // Section header
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

  // Card
  card: {
    borderRadius: 26,
    backgroundColor: C.white,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.hair,
    shadowColor: C.ink,
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  cardImgWrap: {
    height: 200,
    width: "100%",
    backgroundColor: "#111",
  },
  cardIndex: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  cardIndexText: {
    color: C.white,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  cardIndexTotal: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: "700",
  },
  cardTag: {
    position: "absolute",
    top: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.lime,
  },
  cardTagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.ink,
  },
  cardTagText: {
    fontSize: 10,
    color: C.ink,
    fontWeight: "900",
    letterSpacing: 1,
  },
  saveBtn: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  cardBody: { padding: 18 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  cardMetaRow: { flexDirection: "row", marginTop: 4 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, color: C.mute, fontWeight: "600" },

  cardFooter: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarsRow: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.white,
  },
  avatarText: { fontSize: 10, fontWeight: "900", color: C.ink },
  avatarMore: {
    marginLeft: -10,
    backgroundColor: C.ink,
  },
  avatarMoreText: { color: C.lime, fontSize: 9, fontWeight: "900" },

  priceWrap: {
    marginLeft: 12,
    flex: 1,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
  },
  detailsBtn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: C.ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailsBtnText: {
    color: C.lime,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.1,
  },

  // Footer
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
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
  navItemActive: {
    backgroundColor: C.lime,
    flexGrow: 1.6,
  },
  navLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.2,
  },
});
