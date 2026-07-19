import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
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
  FadeIn,
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
const CHIPS = [
  { label: "All", icon: "sparkles-outline" as const },
  { label: "Yoga", icon: "leaf-outline" as const },
  { label: "Strength", icon: "barbell-outline" as const },
  { label: "HIIT", icon: "flame-outline" as const },
  { label: "Pilates", icon: "flower-outline" as const },
  { label: "Running", icon: "walk-outline" as const },
  { label: "Boxing", icon: "hand-left-outline" as const },
];

const FILTERS = [
  { label: "Near me", icon: "location-outline" as const },
  { label: "4.5+ rating", icon: "star-outline" as const },
  { label: "Online", icon: "wifi-outline" as const },
  { label: "Under ₹800", icon: "pricetag-outline" as const },
  { label: "Verified", icon: "checkmark-circle-outline" as const },
];

const TOP_RATED = [
  {
    id: "t1",
    name: "Neha Kapoor",
    specialty: "Vinyasa · Ashtanga",
    rating: 4.9,
    reviews: 218,
    price: 899,
    dist: "1.2 km",
    online: true,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
    accent: "#DAFE4C",
  },
  {
    id: "t2",
    name: "Arjun Mehta",
    specialty: "Powerlifting · Strength",
    rating: 4.8,
    reviews: 342,
    price: 1200,
    dist: "3.4 km",
    online: false,
    verified: true,
    avatar:
      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&q=80",
    accent: "#FFC9A8",
  },
  {
    id: "t3",
    name: "Zara Ali",
    specialty: "Trail · Marathon",
    rating: 4.9,
    reviews: 156,
    price: 749,
    dist: "2.1 km",
    online: true,
    verified: false,
    avatar:
      "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&q=80",
    accent: "#BFE8FF",
  },
];

const ALL_TRAINERS = [
  {
    id: "a1",
    name: "Kabir Nair",
    specialty: "HIIT & Conditioning",
    tag: "HIIT",
    rating: 4.8,
    reviews: 412,
    price: 950,
    dist: "0.8 km",
    online: true,
    verified: true,
    photo:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
    avail: ["M", "T", "W", "T", "F", "S", "S"],
    availActive: [1, 2, 4, 5],
  },
  {
    id: "a2",
    name: "Priya Sharma",
    specialty: "Pilates & Mobility",
    tag: "PILATES",
    rating: 4.9,
    reviews: 287,
    price: 850,
    dist: "1.5 km",
    online: false,
    verified: true,
    photo:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80",
    avail: ["M", "T", "W", "T", "F", "S", "S"],
    availActive: [0, 2, 3, 5, 6],
  },
  {
    id: "a3",
    name: "Rohan Iyer",
    specialty: "Boxing & Cardio",
    tag: "BOXING",
    rating: 4.7,
    reviews: 194,
    price: 1100,
    dist: "4.2 km",
    online: true,
    verified: false,
    photo:
      "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1200&q=80",
    avail: ["M", "T", "W", "T", "F", "S", "S"],
    availActive: [1, 3, 4, 5, 6],
  },
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
// Search Bar (glass, prominent)
// --------------------------------------------------------------------------
function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const focus = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({
    borderColor: focus.value
      ? C.ink
      : (C.hair as any),
    shadowOpacity: interpolate(focus.value, [0, 1], [0.04, 0.12]),
  }));
  return (
    <Animated.View style={[styles.searchWrap, anim]} testID="search-wrap">
      <View style={styles.searchIcon}>
        <Ionicons name="search" size={20} color={C.ink} />
      </View>
      <TextInput
        placeholder="Search coach, sport, or vibe"
        placeholderTextColor={C.mute}
        value={value}
        onChangeText={onChange}
        onFocus={() => (focus.value = withTiming(1))}
        onBlur={() => (focus.value = withTiming(0))}
        style={styles.searchInput}
        testID="search-input"
      />
      <Pressable style={styles.micBtn} onPress={buzz} testID="mic-btn">
        <Ionicons name="mic-outline" size={16} color={C.lime} />
      </Pressable>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Chips
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
            <Ionicons name={c.icon} size={15} color={active ? C.ink : C.inkSoft} />
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
// Filter chips (secondary line, glass w/ close x)
// --------------------------------------------------------------------------
function FilterChips({
  active,
  onToggle,
}: {
  active: Set<number>;
  onToggle: (i: number) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterRow}
      testID="filter-chips"
    >
      <Pressable style={styles.filterFab} onPress={buzz} testID="open-filters">
        <Ionicons name="options-outline" size={16} color={C.lime} />
      </Pressable>
      {FILTERS.map((f, i) => {
        const isOn = active.has(i);
        return (
          <Pressable
            key={f.label}
            onPress={() => {
              buzz();
              onToggle(i);
            }}
            style={[styles.filterChip, isOn && styles.filterChipOn]}
            testID={`filter-${f.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
          >
            <Ionicons
              name={f.icon}
              size={13}
              color={isOn ? C.lime : C.inkSoft}
            />
            <Text style={[styles.filterText, isOn && styles.filterTextOn]}>
              {f.label}
            </Text>
            {isOn && <Ionicons name="close" size={12} color={C.lime} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// --------------------------------------------------------------------------
// Featured Trainer Hero (parallax)
// --------------------------------------------------------------------------
function FeaturedTrainer({
  scrollY,
}: {
  scrollY: Animated.SharedValue<number>;
}) {
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
      testID="featured-trainer"
    >
      <Animated.View style={[StyleSheet.absoluteFill, imgStyle]}>
        <Image
          source="https://images.unsplash.com/photo-1554058429-6c9c56e4f4c4?w=1400&q=80"
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
        />
      </Animated.View>
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.05)", "rgba(0,0,0,0.75)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.heroTicker}>
        <Text style={styles.heroTickerText}>
          ◇ TOP COACH  ◇ TOP COACH  ◇ TOP COACH
        </Text>
      </View>

      <View style={styles.heroTop}>
        <BlurView intensity={40} tint="dark" style={styles.heroBadge}>
          <View style={styles.limeSquare} />
          <Text style={styles.heroBadgeText}>COACH OF THE WEEK</Text>
        </BlurView>
        <View style={styles.heroLive}>
          <PulseDot />
          <Text style={styles.heroLiveText}>ONLINE</Text>
        </View>
      </View>

      <View style={styles.heroBottom}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroKicker}>YOGA · MOBILITY</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            Aisha{"\n"}Verma
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaChip}>
              <Ionicons name="star" size={11} color={C.star} />
              <Text style={styles.heroMetaText}>4.98 · 512</Text>
            </View>
            <View style={styles.heroMetaChip}>
              <Ionicons name="location-outline" size={11} color={C.white} />
              <Text style={styles.heroMetaText}>0.6 km</Text>
            </View>
            <View style={styles.heroMetaChip}>
              <Text style={styles.heroMetaText}>₹ 999 / session</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.joinBtn} onPress={buzz} testID="book-featured">
          <View style={styles.joinBtnInner}>
            <Text style={styles.joinBtnText}>Book</Text>
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
// Top Rated horizontal rail card
// --------------------------------------------------------------------------
function TopRatedCard({
  t,
  index,
}: {
  t: (typeof TOP_RATED)[number];
  index: number;
}) {
  const scale = useSharedValue(1);
  const pressed = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      entering={FadeInDown.duration(400).delay(80 * index)}
      onPressIn={() => (scale.value = withSpring(0.97))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={buzz}
      style={[styles.rrCard, pressed]}
      testID={`top-rated-${t.id}`}
    >
      <View style={[styles.rrImgWrap, { backgroundColor: t.accent }]}>
        <Image
          source={t.avatar}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        {t.online && (
          <View style={styles.rrOnline}>
            <View style={styles.rrOnlineDot} />
          </View>
        )}
        {t.verified && (
          <View style={styles.rrVerified}>
            <Ionicons name="checkmark" size={10} color={C.ink} />
          </View>
        )}
      </View>
      <View style={styles.rrBody}>
        <View style={styles.rrNameRow}>
          <Text style={styles.rrName} numberOfLines={1}>
            {t.name}
          </Text>
          <View style={styles.rrRating}>
            <Ionicons name="star" size={10} color={C.star} />
            <Text style={styles.rrRatingText}>{t.rating}</Text>
          </View>
        </View>
        <Text style={styles.rrSpec} numberOfLines={1}>
          {t.specialty}
        </Text>
        <View style={styles.rrFoot}>
          <Text style={styles.rrPrice}>
            ₹ {t.price}
            <Text style={styles.rrPriceUnit}> /sess</Text>
          </Text>
          <View style={styles.rrDist}>
            <Ionicons name="location-outline" size={10} color={C.mute} />
            <Text style={styles.rrDistText}>{t.dist}</Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// --------------------------------------------------------------------------
// All Trainers editorial list card
// --------------------------------------------------------------------------
function TrainerCard({
  t,
  index,
}: {
  t: (typeof ALL_TRAINERS)[number];
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
      testID={`trainer-card-${t.id}`}
    >
      <View style={styles.cardTop}>
        <View style={styles.trainerImgWrap}>
          <Image
            source={t.photo}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          {t.online && (
            <View style={styles.onlinePill}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>ONLINE</Text>
            </View>
          )}
          <View style={styles.cardIndex}>
            <Text style={styles.cardIndexText}>
              {String(index + 1).padStart(2, "0")}
              <Text style={styles.cardIndexTotal}>
                {" "}/ {String(ALL_TRAINERS.length).padStart(2, "0")}
              </Text>
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <View style={styles.trainerNameRow}>
            <Text style={styles.trainerName} numberOfLines={1}>
              {t.name}
            </Text>
            {t.verified && (
              <View style={styles.verifiedTick}>
                <Ionicons name="checkmark" size={10} color={C.lime} />
              </View>
            )}
          </View>
          <Text style={styles.trainerSpec}>{t.specialty}</Text>

          <View style={styles.tagRow}>
            <View style={styles.trainerTag}>
              <View style={styles.trainerTagDot} />
              <Text style={styles.trainerTagText}>{t.tag}</Text>
            </View>
            <View style={styles.trainerDist}>
              <Ionicons name="location-outline" size={11} color={C.mute} />
              <Text style={styles.trainerDistText}>{t.dist}</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={C.star} />
            <Text style={styles.ratingText}>{t.rating}</Text>
            <Text style={styles.reviewsText}>· {t.reviews} reviews</Text>
          </View>
        </View>
      </View>

      {/* Availability row */}
      <View style={styles.availWrap}>
        <Text style={styles.availLabel}>Next 7 days</Text>
        <View style={styles.availPills}>
          {t.avail.map((d, i) => {
            const on = t.availActive.includes(i);
            return (
              <View
                key={i}
                style={[styles.availPill, on && styles.availPillOn]}
              >
                <Text style={[styles.availText, on && styles.availTextOn]}>
                  {d}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.priceBig}>
            ₹ {t.price}
            <Text style={styles.priceUnit}> /session</Text>
          </Text>
          <Text style={styles.priceHint}>free 15-min intro call</Text>
        </View>
        <View style={styles.footerActions}>
          <Pressable
            style={styles.chatBtn}
            onPress={buzz}
            testID={`chat-${t.id}`}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={C.ink} />
          </Pressable>
          <Pressable
            style={styles.bookBtn}
            onPress={buzz}
            testID={`book-${t.id}`}
          >
            <Text style={styles.bookBtnText}>Book</Text>
            <Feather name="arrow-right" size={14} color={C.lime} />
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
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
    <View
      style={[styles.header, { paddingTop: insets.top + 6 }]}
      testID="trainers-header"
    >
      <Animated.View style={[StyleSheet.absoluteFill, glass]}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.headerHair} />
      </Animated.View>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          testID="back-btn"
        >
          <Feather name="arrow-left" size={18} color={C.lime} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerHello}>Level up with a pro</Text>
          <Text style={styles.headerTitle}>Find a Coach</Text>
        </View>
        <Pressable style={styles.headerIcon} testID="map-btn">
          <Ionicons name="map-outline" size={18} color={C.ink} />
        </Pressable>
        <Pressable style={[styles.headerIcon, { marginLeft: 10 }]} testID="sort-btn">
          <Ionicons name="swap-vertical" size={18} color={C.ink} />
        </Pressable>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Bottom Nav
// --------------------------------------------------------------------------
const NAV = [
  { key: "home", route: "/", icon: "home-outline" as const, label: "Home" },
  { key: "sessions", route: "/", icon: "calendar-outline" as const, label: "Sessions" },
  { key: "coaches", route: "/trainers", icon: "compass-outline" as const, label: "Coaches", active: true },
  { key: "community", route: "/community", icon: "people-outline" as const, label: "Community" },
  { key: "profile", route: "/", icon: "person-outline" as const, label: "Profile" },
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
// Screen
// --------------------------------------------------------------------------
export default function TrainersScreen() {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState(0);
  const [filters, setFilters] = useState<Set<number>>(new Set([0, 1]));
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });
  const toggleFilter = (i: number) => {
    const next = new Set(filters);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setFilters(next);
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AmbientBackdrop />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        testID="trainers-scroll"
      >
        <View style={{ height: 96 }} />

        {/* Search */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <SearchBar value={query} onChange={setQuery} />
        </Animated.View>

        {/* Chips */}
        <Animated.View entering={FadeInDown.duration(400).delay(60)}>
          <Chips value={chip} onChange={setChip} />
        </Animated.View>

        {/* Featured */}
        <FeaturedTrainer scrollY={scrollY} />

        {/* Filter chips */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)}>
          <FilterChips active={filters} onToggle={toggleFilter} />
        </Animated.View>

        {/* Stat strip */}
        <Animated.View
          entering={FadeInDown.duration(450).delay(220)}
          style={styles.statStrip}
          testID="stat-strip"
        >
          <View style={styles.statItem}>
            <Text style={styles.statNum}>248</Text>
            <Text style={styles.statLbl}>coaches</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>12k</Text>
            <Text style={styles.statLbl}>reviews</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.limeDeep }]}>◉ 42</Text>
            <Text style={styles.statLbl}>online</Text>
          </View>
          <Pressable style={styles.statCta} onPress={buzz}>
            <Feather name="arrow-up-right" size={16} color={C.lime} />
          </Pressable>
        </Animated.View>

        {/* Top Rated rail */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ TOP RATED</Text>
            <Text style={styles.sectionTitle}>Elite Coaches</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="see-all-top">
            <Text style={styles.sectionBtnText}>See all</Text>
            <Feather name="arrow-right" size={14} color={C.ink} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rrRail}
          testID="top-rated-rail"
        >
          {TOP_RATED.map((t, i) => (
            <TopRatedCard key={t.id} t={t} index={i} />
          ))}
        </ScrollView>

        {/* All Trainers */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ NEAR YOU</Text>
            <Text style={styles.sectionTitle}>All Coaches</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="sort-all">
            <Ionicons name="filter" size={13} color={C.ink} />
            <Text style={styles.sectionBtnText}>Sort</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 18 }}>
          {ALL_TRAINERS.map((t, i) => (
            <TrainerCard key={t.id} t={t} index={i} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>◇ 245 more coaches near you ◇</Text>
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

  // Search
  searchWrap: {
    marginHorizontal: 20,
    marginTop: 4,
    height: 64,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    shadowColor: C.ink,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  searchIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -0.2,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  micBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
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
  chipActive: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: C.inkSoft,
    letterSpacing: -0.1,
  },
  chipTextActive: { color: C.lime },
  chipAccent: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.lime,
    marginLeft: 2,
  },

  // Filter chips
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
    alignItems: "center",
  },
  filterFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  filterChip: {
    height: 32,
    flexShrink: 0,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: C.glassStrong,
    borderWidth: 1,
    borderColor: C.hair,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  filterChipOn: { backgroundColor: C.ink, borderColor: C.ink },
  filterText: { fontSize: 12, fontWeight: "700", color: C.inkSoft },
  filterTextOn: { color: C.lime },

  // Pulse
  dotWrap: { width: 10, height: 10, justifyContent: "center", alignItems: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotRing: { position: "absolute", width: 8, height: 8, borderRadius: 4 },

  // Hero
  hero: {
    marginHorizontal: 20,
    marginTop: 4,
    height: 380,
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
  limeSquare: { width: 8, height: 8, backgroundColor: C.lime, borderRadius: 2 },
  heroBadgeText: {
    color: C.white,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "800",
  },
  heroLive: { flexDirection: "row", alignItems: "center", gap: 6 },
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
  heroMetaRow: { flexDirection: "row", gap: 6, marginTop: 12, flexWrap: "wrap" },
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
  joinBtnText: {
    fontSize: 15,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.2,
  },
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
    marginTop: 6,
    height: 68,
    borderRadius: 22,
    backgroundColor: C.ink,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  statItem: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  statDiv: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.15)" },
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

  // Top-rated rail
  rrRail: { paddingHorizontal: 20, gap: 12 },
  rrCard: {
    width: 200,
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    overflow: "hidden",
  },
  rrImgWrap: { height: 160, width: "100%", position: "relative" },
  rrOnline: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  rrOnlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.lime,
  },
  rrVerified: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.lime,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.ink,
  },
  rrBody: { padding: 12 },
  rrNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rrName: {
    fontSize: 14,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
    flex: 1,
    marginRight: 6,
  },
  rrRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: C.bg,
  },
  rrRatingText: { fontSize: 11, fontWeight: "900", color: C.ink },
  rrSpec: { fontSize: 11, color: C.mute, fontWeight: "700", marginTop: 3 },
  rrFoot: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rrPrice: { fontSize: 13, fontWeight: "900", color: C.ink },
  rrPriceUnit: { color: C.mute, fontWeight: "700", fontSize: 10 },
  rrDist: { flexDirection: "row", alignItems: "center", gap: 3 },
  rrDistText: { fontSize: 10, fontWeight: "700", color: C.mute },

  // Trainer card
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
    padding: 14,
  },
  cardTop: { flexDirection: "row" },
  trainerImgWrap: {
    width: 108,
    height: 128,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  onlinePill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  onlineText: { color: C.lime, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  cardIndex: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  cardIndexText: {
    color: C.white,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  cardIndexTotal: { color: "rgba(255,255,255,0.55)", fontWeight: "700" },

  trainerNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  trainerName: {
    fontSize: 18,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  verifiedTick: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  trainerSpec: { fontSize: 13, color: C.mute, fontWeight: "700", marginTop: 4 },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  trainerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: C.lime,
  },
  trainerTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.ink,
  },
  trainerTagText: {
    fontSize: 9,
    color: C.ink,
    fontWeight: "900",
    letterSpacing: 1,
  },
  trainerDist: { flexDirection: "row", alignItems: "center", gap: 3 },
  trainerDistText: { fontSize: 11, fontWeight: "700", color: C.mute },
  ratingRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: { fontSize: 13, fontWeight: "900", color: C.ink },
  reviewsText: { fontSize: 11, color: C.mute, fontWeight: "700" },

  availWrap: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.hair,
  },
  availLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "900",
    color: C.mute,
    marginBottom: 8,
  },
  availPills: { flexDirection: "row", gap: 6 },
  availPill: {
    flex: 1,
    height: 34,
    borderRadius: 12,
    backgroundColor: C.bgSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  availPillOn: { backgroundColor: C.ink },
  availText: { fontSize: 11, fontWeight: "900", color: C.mute },
  availTextOn: { color: C.lime },

  cardFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceBig: {
    fontSize: 18,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.4,
  },
  priceUnit: { color: C.mute, fontWeight: "700", fontSize: 12 },
  priceHint: { fontSize: 10, color: C.limeDeep, fontWeight: "800", marginTop: 2 },
  footerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  chatBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.bgSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  bookBtn: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
    backgroundColor: C.ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bookBtnText: {
    color: C.lime,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: -0.1,
  },

  // Footer
  footer: { marginTop: 32, alignItems: "center" },
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
