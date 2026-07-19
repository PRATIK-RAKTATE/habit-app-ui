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
  FadeIn,
} from "react-native-reanimated";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

// --------------------------------------------------------------------------
// Design tokens (shared with Events)
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
const TABS = ["For You", "Following", "Trending"] as const;
const CHIPS = [
  { label: "All", icon: "sparkles-outline" as const },
  { label: "Runners", icon: "walk-outline" as const },
  { label: "Yoga", icon: "leaf-outline" as const },
  { label: "Lifters", icon: "barbell-outline" as const },
  { label: "Cyclists", icon: "bicycle-outline" as const },
  { label: "Trails", icon: "map-outline" as const },
];

const POSTS = [
  {
    id: "1",
    author: "Neha Kapoor",
    handle: "@nehaflows",
    role: "Yoga Coach · Mumbai",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80",
    time: "12m",
    tag: "SUNRISE CLUB",
    title: "5 AM crew — who's rolling tomorrow at Marine Drive?",
    image:
      "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=1200&q=80",
    likes: 428,
    comments: 62,
    shares: 14,
    reactColors: ["#FFB4B4", "#DAFE4C", "#A8D8FF"],
  },
  {
    id: "2",
    author: "Arjun Mehta",
    handle: "@arjun.lifts",
    role: "Strength Coach · Bandra",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80",
    time: "1h",
    tag: "LIFT CLUB",
    title: "Hit a 180kg deadlift PR — the crew showed up 💥",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",
    likes: 1214,
    comments: 184,
    shares: 47,
    reactColors: ["#DAFE4C", "#FFC9A8", "#C9C0FF"],
  },
  {
    id: "3",
    author: "Zara Ali",
    handle: "@zararuns",
    role: "Runner · Powai",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80",
    time: "3h",
    tag: "TRAIL PACK",
    title: "Powai loop @ dawn — 12km, insane light. Ping if in.",
    image:
      "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=1200&q=80",
    likes: 692,
    comments: 88,
    shares: 21,
    reactColors: ["#B9FFE1", "#DAFE4C", "#FFD6A8"],
  },
];

const GROUPS = [
  { name: "Sunrise Yoga", members: "2.4k", color: "#FFE9A8", icon: "leaf-outline" as const },
  { name: "Marine Runners", members: "5.1k", color: "#BFE8FF", icon: "walk-outline" as const },
  { name: "Lift Club", members: "1.8k", color: "#DAFE4C", icon: "barbell-outline" as const },
  { name: "Trail Pack", members: "912", color: "#F4B0FF", icon: "map-outline" as const },
];

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const buzz = () => {
  if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
};

// --------------------------------------------------------------------------
// Ambient orbs
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
      testID="community-tabs"
    >
      <Animated.View style={[styles.tabPill, pill]}>
        <LinearGradient colors={[C.ink, "#242423"]} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {TABS.map((t, i) => (
        <Pressable
          key={t}
          onPress={() => {
            buzz();
            onChange(i);
          }}
          style={styles.tabItem}
          testID={`tab-${t.toLowerCase().replace(" ", "-")}`}
        >
          <Text style={[styles.tabText, value === i && styles.tabTextActive]}>{t}</Text>
          {value === i && (
            <Animated.View entering={FadeIn.duration(200)} style={styles.tabDot} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

// --------------------------------------------------------------------------
// Chip Row
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
      testID="community-chips"
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
// Featured Spotlight (parallax hero)
// --------------------------------------------------------------------------
function FeaturedSpotlight({ scrollY }: { scrollY: Animated.SharedValue<number> }) {
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
      testID="featured-spotlight"
    >
      <Animated.View style={[StyleSheet.absoluteFill, imgStyle]}>
        <Image
          source="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1400&q=80"
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
          ◇ SPOTLIGHT  ◇ SPOTLIGHT  ◇ SPOTLIGHT
        </Text>
      </View>
      <View style={styles.heroTop}>
        <BlurView intensity={40} tint="dark" style={styles.heroBadge}>
          <View style={styles.limeSquare} />
          <Text style={styles.heroBadgeText}>SPOTLIGHT · CREW</Text>
        </BlurView>
        <View style={styles.heroLive}>
          <PulseDot />
          <Text style={styles.heroLiveText}>324 LIVE</Text>
        </View>
      </View>

      <View style={styles.heroBottom}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroKicker}>THIS WEEK · CREW</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>
            Sunrise{"\n"}Runners Club
          </Text>
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaChip}>
              <Ionicons name="people-outline" size={12} color={C.white} />
              <Text style={styles.heroMetaText}>5.1k members</Text>
            </View>
            <View style={styles.heroMetaChip}>
              <Ionicons name="chatbubble-ellipses-outline" size={12} color={C.white} />
              <Text style={styles.heroMetaText}>128 posts</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.joinBtn} onPress={buzz} testID="join-crew">
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
// Popular Groups horizontal rail
// --------------------------------------------------------------------------
function GroupsRail() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.groupsRail}
      testID="groups-rail"
    >
      {GROUPS.map((g, i) => (
        <AnimatedPressable
          key={g.name}
          entering={FadeInDown.duration(400).delay(60 * i)}
          onPress={buzz}
          style={styles.groupCard}
          testID={`group-${g.name.toLowerCase().replace(" ", "-")}`}
        >
          <View style={[styles.groupIcon, { backgroundColor: g.color }]}>
            <Ionicons name={g.icon} size={20} color={C.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.groupName} numberOfLines={1}>
              {g.name}
            </Text>
            <Text style={styles.groupMembers}>{g.members} members</Text>
          </View>
          <View style={styles.groupPlus}>
            <Feather name="plus" size={14} color={C.lime} />
          </View>
        </AnimatedPressable>
      ))}
    </ScrollView>
  );
}

// --------------------------------------------------------------------------
// Feed Post Card (editorial + glass reactions)
// --------------------------------------------------------------------------
function PostCard({
  post,
  index,
}: {
  post: (typeof POSTS)[number];
  index: number;
}) {
  const scale = useSharedValue(1);
  const pressed = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      entering={FadeInDown.duration(520).delay(120 * index)}
      onPressIn={() => (scale.value = withSpring(0.98))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={buzz}
      style={[styles.card, pressed]}
      testID={`post-card-${post.id}`}
    >
      {/* Author row */}
      <View style={styles.postHead}>
        <View style={styles.postAvatarWrap}>
          <Image
            source={post.avatar}
            style={styles.postAvatar}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.postAvatarRing} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.postAuthorRow}>
            <Text style={styles.postAuthor}>{post.author}</Text>
            <View style={styles.postDot} />
            <Text style={styles.postTime}>{post.time}</Text>
          </View>
          <Text style={styles.postRole}>{post.role}</Text>
        </View>
        <Pressable style={styles.postMore} onPress={buzz}>
          <Feather name="more-horizontal" size={18} color={C.ink} />
        </Pressable>
      </View>

      <Text style={styles.postTitle}>{post.title}</Text>

      {/* Image */}
      <View style={styles.postImgWrap}>
        <Image
          source={post.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.35)", "transparent", "rgba(0,0,0,0.35)"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.cardIndex}>
          <Text style={styles.cardIndexText}>
            {String(index + 1).padStart(2, "0")}
            <Text style={styles.cardIndexTotal}>
              {" "}/ {String(POSTS.length).padStart(2, "0")}
            </Text>
          </Text>
        </View>
        <View style={styles.cardTag}>
          <View style={styles.cardTagDot} />
          <Text style={styles.cardTagText}>{post.tag}</Text>
        </View>
        <BlurView intensity={30} tint="light" style={styles.saveBtn}>
          <Ionicons name="bookmark-outline" size={16} color={C.white} />
        </BlurView>
      </View>

      {/* Reactions row */}
      <View style={styles.postFooter}>
        <View style={styles.reactRow}>
          {post.reactColors.map((c, i) => (
            <View
              key={i}
              style={[
                styles.reactDot,
                { backgroundColor: c, marginLeft: i === 0 ? 0 : -8 },
              ]}
            />
          ))}
          <Text style={styles.reactCount}>{post.likes.toLocaleString()}</Text>
        </View>

        <View style={styles.reactActions}>
          <Pressable style={styles.reactBtn} onPress={buzz} testID={`like-${post.id}`}>
            <Ionicons name="heart-outline" size={16} color={C.ink} />
          </Pressable>
          <Pressable style={styles.reactBtn} onPress={buzz} testID={`comment-${post.id}`}>
            <Ionicons name="chatbubble-outline" size={14} color={C.ink} />
            <Text style={styles.reactBtnText}>{post.comments}</Text>
          </Pressable>
          <Pressable style={styles.shareBtn} onPress={buzz} testID={`share-${post.id}`}>
            <Feather name="send" size={13} color={C.lime} />
            <Text style={styles.shareBtnText}>Share</Text>
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
      testID="community-header"
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
          <Feather name="arrow-left" size={18} color={C.ink} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerHello}>Together we move</Text>
          <Text style={styles.headerTitle}>Community</Text>
        </View>
        <Pressable style={styles.headerIcon} testID="dm-btn">
          <Ionicons name="paper-plane-outline" size={18} color={C.ink} />
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
// Bottom Nav
// --------------------------------------------------------------------------
const NAV = [
  { key: "home", route: "/", icon: "home-outline" as const, label: "Home" },
  { key: "sessions", route: "/", icon: "calendar-outline" as const, label: "Sessions" },
  { key: "coaches", route: "/community", icon: "compass-outline" as const, label: "Coaches" },
  {
    key: "community",
    route: "/community",
    icon: "people-outline" as const,
    label: "Community",
    active: true,
  },
  { key: "profile", route: "/community", icon: "person-outline" as const, label: "Profile" },
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
// Main Screen
// --------------------------------------------------------------------------
export default function CommunityScreen() {
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <AmbientBackdrop />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        testID="community-scroll"
      >
        <View style={{ height: 96 }} />

        <Animated.View entering={FadeInDown.duration(400)}>
          <SegmentedTabs value={tab} onChange={setTab} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(60)}>
          <Chips value={chip} onChange={setChip} />
        </Animated.View>

        <FeaturedSpotlight scrollY={scrollY} />

        {/* Stat strip */}
        <Animated.View
          entering={FadeInDown.duration(450).delay(220)}
          style={styles.statStrip}
          testID="stat-strip"
        >
          <View style={styles.statItem}>
            <Text style={styles.statNum}>12k</Text>
            <Text style={styles.statLbl}>members</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>384</Text>
            <Text style={styles.statLbl}>posts today</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: C.limeDeep }]}>◉ 324</Text>
            <Text style={styles.statLbl}>online</Text>
          </View>
          <Pressable style={styles.statCta} onPress={buzz}>
            <Feather name="arrow-up-right" size={16} color={C.lime} />
          </Pressable>
        </Animated.View>

        {/* Popular Groups */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ POPULAR</Text>
            <Text style={styles.sectionTitle}>Your Crews</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="see-all-crews">
            <Text style={styles.sectionBtnText}>Explore</Text>
            <Feather name="arrow-right" size={14} color={C.ink} />
          </Pressable>
        </View>
        <GroupsRail />

        {/* Feed */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ FRESH</Text>
            <Text style={styles.sectionTitle}>The Feed</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="new-post">
            <Feather name="edit-3" size={13} color={C.ink} />
            <Text style={styles.sectionBtnText}>Post</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 18 }}>
          {POSTS.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>◇ pull to refresh the feed ◇</Text>
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
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.mute,
    letterSpacing: -0.2,
  },
  tabTextActive: { color: C.lime },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.lime },

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

  // Pulse
  dotWrap: {
    width: 10,
    height: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotRing: { position: "absolute", width: 8, height: 8, borderRadius: 4 },

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
    marginTop: 18,
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

  // Section head
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

  // Groups rail
  groupsRail: {
    paddingHorizontal: 20,
    gap: 12,
  },
  groupCard: {
    width: 220,
    padding: 12,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  groupName: {
    fontSize: 14,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
  },
  groupMembers: {
    fontSize: 11,
    color: C.mute,
    fontWeight: "700",
    marginTop: 2,
  },
  groupPlus: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },

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
    padding: 16,
  },
  postHead: { flexDirection: "row", alignItems: "center" },
  postAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
  },
  postAvatar: { width: "100%", height: "100%" },
  postAvatarRing: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: C.lime,
    borderRadius: 22,
  },
  postAuthorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  postAuthor: {
    fontSize: 14,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
  },
  postDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: C.mute },
  postTime: { fontSize: 12, color: C.mute, fontWeight: "700" },
  postRole: { fontSize: 12, color: C.mute, fontWeight: "600", marginTop: 2 },
  postMore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.bgSoft,
  },

  postTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -0.3,
    marginTop: 14,
    marginBottom: 12,
  },

  postImgWrap: {
    height: 220,
    borderRadius: 20,
    overflow: "hidden",
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
  cardIndexTotal: { color: "rgba(255,255,255,0.55)", fontWeight: "700" },
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
  cardTagDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.ink },
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

  // Post footer / reactions
  postFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reactRow: { flexDirection: "row", alignItems: "center" },
  reactDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.white,
  },
  reactCount: {
    fontSize: 12,
    fontWeight: "800",
    color: C.ink,
    marginLeft: 8,
  },
  reactActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  reactBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: C.bgSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  reactBtnText: { fontSize: 12, fontWeight: "800", color: C.ink },
  shareBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: C.ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  shareBtnText: { fontSize: 12, fontWeight: "900", color: C.lime },

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
