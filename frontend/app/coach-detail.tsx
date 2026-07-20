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
  useDerivedValue,
  interpolate,
  Extrapolation,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  FadeInDown,
  FadeIn,
  useAnimatedProps,
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
  inkDim: "rgba(255,255,255,0.06)",
  mute: "#6E6E66",
  hair: "rgba(10,10,10,0.08)",
  hairDark: "rgba(255,255,255,0.1)",
  glass: "rgba(255,255,255,0.55)",
  glassStrong: "rgba(255,255,255,0.75)",
  lime: "#DAFE4C",
  limeDeep: "#B8E132",
  white: "#FFFFFF",
  star: "#FFB84D",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedText = Animated.createAnimatedComponent(Text);
const buzz = (kind: "light" | "medium" = "light") => {
  if (Platform.OS === "web") return;
  if (kind === "light") Haptics.selectionAsync().catch(() => {});
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

// --------------------------------------------------------------------------
// Data (mirrors the reference)
// --------------------------------------------------------------------------
const COACH = {
  name: "Fatima Al-Said",
  handle: "@fatimaflows",
  role: "Yoga · Women's Wellness",
  city: "Dubai, UAE",
  bio:
    "Certified 500-hour yoga teacher blending vinyasa flow with breathwork and mindful strength. Women-first sessions, both online and studio.",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
  cover:
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1400&q=80",
  rating: 4.9,
  reviewsCount: 128,
  students: 6,
  bookings: 3,
  price: 22400,
  tags: ["Women's Wellness", "Yoga"],
  langs: ["Arabic", "English"],
};

const SERVICES = [
  {
    id: "svc-1",
    kind: "SUBSCRIPTION",
    title: "Private Yoga Sessions",
    price: 22400,
    unit: "monthly",
    featured: true,
    chips: ["60 min", "Online & in-person", "Up to 5"],
    perks: [
      "Personalised programme",
      "1:1 tailored sessions",
      "WhatsApp check-ins",
    ],
  },
  {
    id: "svc-2",
    kind: "SUBSCRIPTION",
    title: "Group Yoga Flow",
    price: 22400,
    unit: "monthly",
    featured: false,
    chips: ["75 min", "In-person", "Up to 12"],
    perks: ["Community practice", "Slow strengthening", "Mind-body connection"],
  },
  {
    id: "svc-3",
    kind: "COACHING PLAN",
    title: "Online Yoga Membership",
    price: 3500,
    unit: "one-time",
    featured: false,
    chips: ["60 min", "Online", "Up to 20"],
    perks: [
      "Daily practice support",
      "On-demand library access",
      "Live sessions",
    ],
  },
];

const SLOTS = [
  { id: "s1", from: "06:00", to: "09:00", date: "25 JUL 2026", mode: "Online · in-person", dur: "180 min", open: true },
  { id: "s2", from: "17:00", to: "20:00", date: "26 JUL 2026", mode: "Online · in-person", dur: "180 min", open: true },
  { id: "s3", from: "07:00", to: "10:00", date: "27 JUL 2026", mode: "Online · in-person", dur: "180 min", open: true },
  { id: "s4", from: "06:30", to: "09:30", date: "28 JUL 2026", mode: "Online · in-person", dur: "180 min", open: true },
  { id: "s5", from: "06:00", to: "09:00", date: "29 JUL 2026", mode: "Online · in-person", dur: "180 min", open: true },
  { id: "s6", from: "17:00", to: "20:00", date: "30 JUL 2026", mode: "Online · in-person", dur: "180 min", open: true },
];

const REVIEW_DIST = [
  { stars: 5, pct: 0.82 },
  { stars: 4, pct: 0.12 },
  { stars: 3, pct: 0.04 },
  { stars: 2, pct: 0.01 },
  { stars: 1, pct: 0.01 },
];

const REVIEWS = [
  {
    id: "r1",
    name: "Aisha K.",
    handle: "@aishamoves",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    when: "2d",
    stars: 5,
    text: "Fatima is magic. My mornings feel completely different — I actually stay for the full breath work.",
    accent: "#DAFE4C",
  },
  {
    id: "r2",
    name: "Sana R.",
    handle: "@sana.r",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
    when: "1w",
    stars: 5,
    text: "Best value for a private yoga package in Dubai. She actually remembers what you worked on last week.",
    accent: "#BFE8FF",
  },
];

// --------------------------------------------------------------------------
// Ambient
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

function PulseDot({ color = C.lime, size = 8 }: { color?: string; size?: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1400 }), -1, false);
  }, [p]);
  const ring = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 1], [0.6, 0]),
    transform: [{ scale: interpolate(p.value, [0, 1], [1, 2.6]) }],
  }));
  return (
    <View style={{ width: size + 2, height: size + 2, justifyContent: "center", alignItems: "center" }}>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          ring,
        ]}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

// --------------------------------------------------------------------------
// Number counter — animates from 0 to `to` on mount
// --------------------------------------------------------------------------
function CountUp({
  to,
  prefix = "",
  suffix = "",
  duration = 1400,
  decimals = 0,
  style,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  style?: any;
}) {
  const [txt, setTxt] = useState(
    `${prefix}${(0).toFixed(decimals)}${suffix}`
  );
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = eased * to;
      const formatted = decimals
        ? val.toFixed(decimals)
        : Math.round(val).toLocaleString();
      setTxt(`${prefix}${formatted}${suffix}`);
      if (t >= 1) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [to, duration, decimals, prefix, suffix]);
  return <Text style={style}>{txt}</Text>;
}

// --------------------------------------------------------------------------
// Header — sticky glass
// --------------------------------------------------------------------------
function Header({ scrollY }: { scrollY: Animated.SharedValue<number> }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const glass = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [40, 120], [0, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [40, 120], [8, 0], Extrapolation.CLAMP) },
    ],
  }));
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]} testID="coach-header">
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

        <Animated.View style={[styles.headerTitleWrap, titleStyle]}>
          <Text style={styles.headerName}>{COACH.name}</Text>
          <View style={styles.headerRatingRow}>
            <Ionicons name="star" size={10} color={C.star} />
            <Text style={styles.headerRatingText}>
              {COACH.rating} · {COACH.reviewsCount} reviews
            </Text>
          </View>
        </Animated.View>

        <Pressable style={styles.headerIcon} testID="share-btn">
          <Ionicons name="share-outline" size={18} color={C.ink} />
        </Pressable>
        <Pressable
          style={[styles.headerIcon, { marginLeft: 10 }]}
          testID="save-btn"
        >
          <Ionicons name="bookmark-outline" size={18} color={C.ink} />
        </Pressable>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Profile Hero — dark editorial card with big backdrop initial + stats grid
// --------------------------------------------------------------------------
function ProfileHero({ scrollY }: { scrollY: Animated.SharedValue<number> }) {
  const coverStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-200, 0, 200],
          [-40, 0, 30],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-200, 0],
          [1.25, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      style={styles.hero}
      testID="coach-hero"
    >
      {/* Cover with gradient */}
      <View style={styles.heroCover}>
        <Animated.View style={[StyleSheet.absoluteFill, coverStyle]}>
          <Image
            source={COACH.cover}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={["rgba(10,10,10,0.15)", "rgba(10,10,10,0.85)"]}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Ticker */}
        <View style={styles.heroTicker}>
          <Text style={styles.heroTickerText}>
            ◇ TOP COACH  ◇ TOP COACH  ◇ TOP COACH
          </Text>
        </View>

        {/* Coach badges */}
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadge}>
            <View style={styles.limeSquare} />
            <Text style={styles.heroBadgeText}>COACH OF THE MONTH</Text>
          </View>
          <View style={styles.heroLive}>
            <PulseDot />
            <Text style={styles.heroLiveText}>ONLINE</Text>
          </View>
        </View>
      </View>

      {/* Info block */}
      <View style={styles.heroBody}>
        {/* Giant backdrop letter */}
        <Text style={styles.bigLetter} pointerEvents="none">
          F
        </Text>

        <View style={styles.avatarRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarRing} />
            <View style={styles.avatarInner}>
              <Image
                source={COACH.avatar}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
              />
            </View>
            <View style={styles.avatarVerified}>
              <Ionicons name="checkmark" size={10} color={C.ink} />
            </View>
          </View>

          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.coachName}>{COACH.name}</Text>
            <Text style={styles.coachRole}>{COACH.role}</Text>
            <View style={styles.coachMetaRow}>
              <View style={styles.coachMetaChip}>
                <Ionicons name="location-outline" size={11} color={C.white} />
                <Text style={styles.coachMetaText}>{COACH.city}</Text>
              </View>
              <View style={styles.coachMetaChip}>
                <Text style={styles.coachMetaText}>{COACH.handle}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats 2x2 grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <View style={styles.statHead}>
              <Ionicons name="star" size={11} color={C.star} />
              <Text style={styles.statLbl}>RATING</Text>
            </View>
            <View style={styles.statNumRow}>
              <CountUp to={COACH.rating} decimals={1} style={styles.statNum} />
              <Text style={styles.statNumUnit}>/5</Text>
            </View>
          </View>
          <View style={styles.statCellDiv} />
          <View style={styles.statCell}>
            <View style={styles.statHead}>
              <Ionicons name="people-outline" size={11} color={C.lime} />
              <Text style={styles.statLbl}>STUDENTS</Text>
            </View>
            <CountUp to={COACH.students} style={styles.statNum} />
          </View>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <View style={styles.statHead}>
              <Ionicons name="calendar-outline" size={11} color={C.lime} />
              <Text style={styles.statLbl}>BOOKINGS</Text>
            </View>
            <CountUp to={COACH.bookings} style={styles.statNum} />
          </View>
          <View style={styles.statCellDiv} />
          <View style={styles.statCell}>
            <View style={styles.statHead}>
              <Ionicons name="pricetag-outline" size={11} color={C.lime} />
              <Text style={styles.statLbl}>FROM</Text>
            </View>
            <View style={styles.statNumRow}>
              <CountUp
                to={COACH.price}
                prefix="$"
                style={[styles.statNum, { color: C.lime }]}
              />
              <Text style={styles.statNumUnit}>/mo</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// About Card
// --------------------------------------------------------------------------
function AboutCard() {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.about} testID="about-card">
      <View style={styles.aboutHead}>
        <Text style={styles.sectionKicker}>◇ ABOUT</Text>
        <Text style={styles.aboutTitle}>About {COACH.name.split(" ")[0]}</Text>
      </View>

      <Text style={styles.aboutText} numberOfLines={open ? 0 : 3}>
        {COACH.bio}
      </Text>
      <Pressable onPress={() => setOpen((v) => !v)} testID="about-toggle">
        <Text style={styles.aboutToggle}>
          {open ? "Show less" : "Read more"} ↗
        </Text>
      </Pressable>

      <Text style={[styles.aboutSubLbl, { marginTop: 20 }]}>SPECIALITY</Text>
      <View style={styles.tagsRow}>
        {COACH.tags.map((t) => (
          <View key={t} style={styles.tag}>
            <View style={styles.tagDot} />
            <Text style={styles.tagText}>{t}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.aboutSubLbl, { marginTop: 16 }]}>LANGUAGES</Text>
      <View style={styles.tagsRow}>
        {COACH.langs.map((l) => (
          <View key={l} style={[styles.tag, styles.tagAlt]}>
            <Ionicons name="language-outline" size={11} color={C.limeDeep} />
            <Text style={[styles.tagText, styles.tagTextAlt]}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Profile details (dark card)
// --------------------------------------------------------------------------
function ProfileDetails() {
  return (
    <View style={styles.details} testID="profile-details">
      <View style={styles.detailsHead}>
        <Text style={styles.detailsTitle}>◇ Profile Details</Text>
        <Pressable style={styles.detailsShareBtn} onPress={buzz}>
          <Feather name="external-link" size={12} color={C.lime} />
        </Pressable>
      </View>
      <View style={styles.detailsRows}>
        <View style={styles.detailsRow}>
          <View style={styles.detailsIcon}>
            <Ionicons name="call-outline" size={16} color={C.lime} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailsLbl}>PHONE</Text>
            <Text style={styles.detailsVal}>+971 55 208 4412</Text>
          </View>
          <View style={styles.detailsPill}>
            <Text style={styles.detailsPillText}>Verified</Text>
          </View>
        </View>
        <View style={styles.detailsDiv} />
        <View style={styles.detailsRow}>
          <View style={styles.detailsIcon}>
            <Ionicons name="location-outline" size={16} color={C.lime} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailsLbl}>STUDIO</Text>
            <Text style={styles.detailsVal}>Al Wasl · Dubai, UAE</Text>
          </View>
          <View style={styles.detailsPill}>
            <Text style={styles.detailsPillText}>2.4 km</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Services — featured dark card + regular white cards
// --------------------------------------------------------------------------
function ServiceCard({
  s,
  index,
  selected,
  onSelect,
}: {
  s: (typeof SERVICES)[number];
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const pressed = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const featured = s.featured;
  return (
    <AnimatedPressable
      entering={FadeInDown.duration(400).delay(80 * index)}
      onPressIn={() => (scale.value = withSpring(0.98))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={() => {
        buzz();
        onSelect();
      }}
      style={[
        styles.svc,
        featured ? styles.svcDark : styles.svcLight,
        selected && !featured && styles.svcLightActive,
        pressed,
      ]}
      testID={`service-${s.id}`}
    >
      {/* Index tape */}
      <View
        style={[
          styles.svcIndex,
          { backgroundColor: featured ? "rgba(255,255,255,0.12)" : C.bgSoft },
        ]}
      >
        <Text
          style={[styles.svcIndexText, { color: featured ? C.lime : C.mute }]}
        >
          {String(index + 1).padStart(2, "0")}
          <Text style={styles.svcIndexTotal}>
            {" "}/ {String(SERVICES.length).padStart(2, "0")}
          </Text>
        </Text>
      </View>

      <View style={styles.svcHead}>
        <View style={{ flex: 1 }}>
          <View style={styles.svcKindRow}>
            <View
              style={[
                styles.svcKindDot,
                { backgroundColor: featured ? C.lime : C.ink },
              ]}
            />
            <Text
              style={[
                styles.svcKind,
                { color: featured ? C.lime : C.mute },
              ]}
            >
              {s.kind}
            </Text>
          </View>
          <Text
            style={[
              styles.svcPrice,
              { color: featured ? C.white : C.ink, textAlign: "right" },
            ]}
          />
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.svcPriceBig, { color: featured ? C.white : C.ink }]}>
            ${s.price.toLocaleString()}
          </Text>
          <Text
            style={[
              styles.svcPriceUnit,
              { color: featured ? "rgba(255,255,255,0.6)" : C.mute },
            ]}
          >
            {s.unit}
          </Text>
        </View>
      </View>

      <Text style={[styles.svcTitle, { color: featured ? C.white : C.ink }]}>
        {s.title}
      </Text>

      <View style={styles.svcChips}>
        {s.chips.map((c, i) => (
          <View
            key={i}
            style={[
              styles.svcChip,
              {
                backgroundColor: featured
                  ? "rgba(218,254,76,0.14)"
                  : C.bgSoft,
                borderColor: featured ? C.lime : "transparent",
              },
            ]}
          >
            <Text
              style={[
                styles.svcChipText,
                { color: featured ? C.lime : C.inkSoft },
              ]}
            >
              {c}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.svcPerks}>
        {s.perks.map((p, i) => (
          <View key={i} style={styles.svcPerk}>
            <Ionicons
              name="checkmark-circle"
              size={13}
              color={featured ? C.lime : C.limeDeep}
            />
            <Text
              style={[
                styles.svcPerkText,
                { color: featured ? "rgba(255,255,255,0.85)" : C.inkSoft },
              ]}
            >
              {p}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.svcFooter}>
        {selected ? (
          <View style={styles.svcSelected}>
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={featured ? C.ink : C.lime}
            />
            <Text
              style={[
                styles.svcSelectedText,
                { color: featured ? C.ink : C.lime },
              ]}
            >
              Selected service
            </Text>
            <Feather name="arrow-right" size={14} color={featured ? C.ink : C.lime} />
          </View>
        ) : (
          <View style={styles.svcCta}>
            <Text
              style={[
                styles.svcCtaText,
                { color: featured ? C.ink : C.lime },
              ]}
            >
              Select service
            </Text>
            <Feather
              name="arrow-right"
              size={14}
              color={featured ? C.ink : C.lime}
            />
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

// --------------------------------------------------------------------------
// Availability slot card
// --------------------------------------------------------------------------
function SlotCard({
  slot,
  index,
  selected,
  onSelect,
}: {
  slot: (typeof SLOTS)[number];
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <AnimatedPressable
      entering={FadeInDown.duration(360).delay(50 * index)}
      onPress={() => {
        buzz();
        onSelect();
      }}
      style={[styles.slot, selected && styles.slotActive]}
      testID={`slot-${slot.id}`}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.slotTimeRow}>
          <Text style={[styles.slotTime, selected && styles.slotTimeActive]}>
            {slot.from} — {slot.to}
          </Text>
          <View
            style={[
              styles.slotOpen,
              selected && { backgroundColor: C.ink },
            ]}
          >
            <View style={styles.slotOpenDot} />
            <Text
              style={[
                styles.slotOpenText,
                selected && { color: C.lime },
              ]}
            >
              {slot.open ? "Open" : "Full"}
            </Text>
          </View>
        </View>
        <Text style={[styles.slotDate, selected && styles.slotDateActive]}>
          {slot.date}
        </Text>
        <View style={styles.slotFoot}>
          <Text style={[styles.slotMeta, selected && styles.slotMetaActive]}>
            {slot.mode}
          </Text>
          <View
            style={[styles.slotDurDot, selected && { backgroundColor: C.lime }]}
          />
          <Text style={[styles.slotMeta, selected && styles.slotMetaActive]}>
            {slot.dur}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

// --------------------------------------------------------------------------
// Reviews section with animated distribution bars
// --------------------------------------------------------------------------
function ReviewBar({
  stars,
  pct,
  index,
}: {
  stars: number;
  pct: number;
  index: number;
}) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withTiming(pct, { duration: 900 + index * 80, easing: Easing.out(Easing.cubic) });
  }, [pct, index, v]);
  const style = useAnimatedStyle(() => ({
    width: `${v.value * 100}%`,
  }));
  return (
    <View style={styles.revRow}>
      <Text style={styles.revStar}>{stars}</Text>
      <Ionicons name="star" size={10} color={C.star} />
      <View style={styles.revTrack}>
        <Animated.View style={[styles.revFill, style]} />
      </View>
      <Text style={styles.revPct}>{Math.round(pct * 100)}%</Text>
    </View>
  );
}

function ReviewsSection() {
  return (
    <View style={styles.reviews} testID="reviews">
      <View style={styles.revHead}>
        <Text style={styles.sectionKickerDark}>◇ REVIEWS</Text>
        <Text style={styles.revTitle}>What students say</Text>
      </View>

      <View style={styles.revSummary}>
        <View style={styles.revScore}>
          <Text style={styles.revScoreNum}>{COACH.rating}</Text>
          <View style={styles.revScoreStars}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons key={i} name="star" size={11} color={C.star} />
            ))}
          </View>
          <Text style={styles.revScoreLbl}>
            {COACH.reviewsCount} reviews
          </Text>
        </View>
        <View style={styles.revBars}>
          {REVIEW_DIST.map((r, i) => (
            <ReviewBar key={r.stars} stars={r.stars} pct={r.pct} index={i} />
          ))}
        </View>
      </View>

      {REVIEWS.map((r, i) => (
        <Animated.View
          key={r.id}
          entering={FadeInDown.duration(400).delay(80 * i)}
          style={styles.revCard}
          testID={`review-${r.id}`}
        >
          <View style={styles.revUserRow}>
            <View style={[styles.revAvatar, { backgroundColor: r.accent }]}>
              <Image
                source={r.avatar}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={200}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.revUserNameRow}>
                <Text style={styles.revUserName}>{r.name}</Text>
                <Text style={styles.revUserWhen}>· {r.when}</Text>
              </View>
              <Text style={styles.revUserHandle}>{r.handle}</Text>
            </View>
            <View style={styles.revStars}>
              {Array.from({ length: r.stars }).map((_, i) => (
                <Ionicons key={i} name="star" size={10} color={C.lime} />
              ))}
            </View>
          </View>
          <Text style={styles.revText}>{r.text}</Text>
        </Animated.View>
      ))}

      <Pressable style={styles.revMoreBtn} onPress={buzz} testID="all-reviews">
        <Text style={styles.revMoreText}>See all 128 reviews</Text>
        <Feather name="arrow-right" size={14} color={C.lime} />
      </Pressable>
    </View>
  );
}

// --------------------------------------------------------------------------
// Sticky Book CTA (floating bar)
// --------------------------------------------------------------------------
function BookCta({
  service,
  slot,
  disabled,
  onPress,
}: {
  service: (typeof SERVICES)[number];
  slot: (typeof SLOTS)[number] | null;
  disabled: boolean;
  onPress: () => void;
}) {
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const pressed = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.55 : 1,
  }));
  return (
    <View
      style={[styles.bookWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <BlurView intensity={40} tint="light" style={styles.bookGlass} />
      <View style={styles.bookRow}>
        <View style={styles.bookSummary}>
          <Text style={styles.bookSumLbl}>
            {service.title}  ·  {slot ? slot.date.split(" ").slice(0, 2).join(" ") : "pick a slot"}
          </Text>
          <View style={styles.bookSumRow}>
            <Text style={styles.bookSumPrice}>${service.price.toLocaleString()}</Text>
            <Text style={styles.bookSumUnit}>/ {service.unit}</Text>
          </View>
        </View>
        <AnimatedPressable
          onPressIn={() => (scale.value = withSpring(0.97))}
          onPressOut={() => (scale.value = withSpring(1))}
          onPress={() => !disabled && onPress()}
          style={[styles.bookBtn, pressed]}
          disabled={disabled}
          testID="book-cta"
        >
          <Text style={styles.bookBtnText}>
            {disabled ? "Pick a slot" : "Book"}
          </Text>
          <View style={styles.bookBtnArrow}>
            <Feather name="arrow-up-right" size={18} color={C.lime} />
          </View>
        </AnimatedPressable>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Screen
// --------------------------------------------------------------------------
export default function CoachDetailScreen() {
  const [service, setService] = useState(SERVICES[0].id);
  const [slot, setSlot] = useState<string | null>(SLOTS[0].id);
  const [confirming, setConfirming] = useState(false);
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const selectedService =
    SERVICES.find((s) => s.id === service) ?? SERVICES[0];
  const selectedSlot = SLOTS.find((s) => s.id === slot) ?? null;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AmbientBackdrop />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        testID="coach-scroll"
      >
        <View style={{ height: 96 }} />

        <View style={styles.pageBlock}>
          <ProfileHero scrollY={scrollY} />
        </View>

        <View style={styles.pageBlock}>
          <AboutCard />
        </View>

        <View style={styles.pageBlock}>
          <ProfileDetails />
        </View>

        {/* Services */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ SERVICES</Text>
            <Text style={styles.sectionTitle}>Services</Text>
          </View>
          <Text style={styles.sectionHint}>All prices in Indian Rupees</Text>
        </View>
        <View style={styles.pageBlock}>
          <View style={{ gap: 16 }}>
            {SERVICES.map((s, i) => (
              <ServiceCard
                key={s.id}
                s={s}
                index={i}
                selected={service === s.id}
                onSelect={() => setService(s.id)}
              />
            ))}
          </View>
        </View>

        {/* Availability */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ CALENDAR</Text>
            <Text style={styles.sectionTitle}>Availability preview</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="all-slots">
            <Ionicons name="calendar-outline" size={13} color={C.ink} />
            <Text style={styles.sectionBtnText}>All slots</Text>
          </Pressable>
        </View>

        <View style={styles.pageBlock}>
          <View style={styles.availHead}>
            <Text style={styles.availHeadLbl}>OPEN AVAILABILITY</Text>
            <View style={styles.availHeadRight}>
              <Text style={styles.availHeadPrice}>
                ${selectedService.price.toLocaleString()}
              </Text>
              <Text style={styles.availHeadUnit}> / {selectedService.unit}</Text>
            </View>
          </View>
          <View style={{ gap: 12 }}>
            {SLOTS.map((s, i) => (
              <SlotCard
                key={s.id}
                slot={s}
                index={i}
                selected={slot === s.id}
                onSelect={() => setSlot(s.id)}
              />
            ))}
          </View>
        </View>

        {/* Reviews */}
        <View style={styles.pageBlock}>
          <ReviewsSection />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>◇ join 128+ students moving with Fatima ◇</Text>
        </View>
        <View style={{ height: 160 }} />
      </Animated.ScrollView>

      <Header scrollY={scrollY} />
      <BookCta
        service={selectedService}
        slot={selectedSlot}
        disabled={!selectedSlot}
        onPress={() => {
          buzz("medium");
          setConfirming(true);
        }}
      />
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
  headerTitleWrap: { flex: 1, marginLeft: 12 },
  headerName: {
    fontSize: 15,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.4,
  },
  headerRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  headerRatingText: { fontSize: 11, color: C.mute, fontWeight: "700" },
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

  // Hero
  hero: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: C.ink,
  },
  heroCover: {
    height: 220,
    width: "100%",
    position: "relative",
  },
  heroTicker: {
    position: "absolute",
    top: 18,
    right: -30,
    transform: [{ rotate: "90deg" }],
    opacity: 0.55,
  },
  heroTickerText: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 6,
    fontWeight: "800",
  },
  heroBadgeRow: {
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
    backgroundColor: "rgba(0,0,0,0.5)",
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
  heroLive: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroLiveText: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "900",
  },

  heroBody: {
    padding: 20,
    overflow: "hidden",
    position: "relative",
  },
  bigLetter: {
    position: "absolute",
    right: -14,
    top: -30,
    fontSize: 220,
    fontWeight: "900",
    color: C.lime,
    opacity: 0.11,
    letterSpacing: -8,
  },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -46,
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 42,
    backgroundColor: C.lime,
  },
  avatarInner: {
    width: 74,
    height: 74,
    borderRadius: 37,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: C.ink,
  },
  avatarVerified: {
    position: "absolute",
    right: -2,
    bottom: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.lime,
    borderWidth: 2,
    borderColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  coachName: {
    color: C.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 20,
  },
  coachRole: {
    color: C.lime,
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "800",
    marginTop: 3,
  },
  coachMetaRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    flexWrap: "wrap",
  },
  coachMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  coachMetaText: { color: C.white, fontSize: 10, fontWeight: "700" },

  statsGrid: {
    flexDirection: "row",
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 14,
    alignItems: "center",
  },
  statCell: { flex: 1 },
  statCellDiv: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 8,
  },
  statHead: { flexDirection: "row", alignItems: "center", gap: 5 },
  statLbl: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    letterSpacing: 1.3,
    fontWeight: "900",
  },
  statNumRow: { flexDirection: "row", alignItems: "flex-end" },
  statNum: {
    color: C.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 4,
  },
  statNumUnit: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 3,
    marginBottom: 3,
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
  sectionHint: {
    fontSize: 10,
    color: C.mute,
    letterSpacing: 1.4,
    fontWeight: "800",
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

  // About
  about: {
    marginTop: 18,
    borderRadius: 26,
    backgroundColor: C.ink,
    padding: 20,
  },
  aboutHead: { marginBottom: 12 },
  aboutTitle: {
    color: C.white,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 2,
  },
  aboutText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  aboutToggle: {
    color: C.lime,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: -0.2,
    marginTop: 8,
  },
  aboutSubLbl: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "900",
    marginBottom: 8,
  },
  tagsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: C.lime,
  },
  tagDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.ink },
  tagText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.1,
  },
  tagAlt: {
    backgroundColor: "rgba(218,254,76,0.14)",
    borderWidth: 1,
    borderColor: C.lime,
  },
  tagTextAlt: { color: C.lime },

  // Profile details
  details: {
    marginTop: 18,
    borderRadius: 26,
    backgroundColor: C.ink,
    padding: 20,
  },
  detailsHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  detailsTitle: {
    color: C.white,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  detailsShareBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(218,254,76,0.14)",
    borderWidth: 1,
    borderColor: C.lime,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsRows: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 4,
  },
  detailsRow: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailsIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(218,254,76,0.14)",
    borderWidth: 1,
    borderColor: C.lime,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsLbl: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  detailsVal: {
    color: C.white,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: -0.2,
  },
  detailsPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: C.lime,
  },
  detailsPillText: {
    color: C.ink,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "900",
  },
  detailsDiv: { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginHorizontal: 8 },

  // Services
  svc: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    padding: 18,
    shadowColor: C.ink,
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  svcDark: { backgroundColor: C.ink, borderColor: C.ink },
  svcLight: { backgroundColor: C.white, borderColor: C.hair },
  svcLightActive: { borderColor: C.ink, borderWidth: 1.5 },
  svcIndex: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  svcIndexText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  svcIndexTotal: { opacity: 0.55, fontWeight: "700" },
  svcHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  svcKindRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  svcKindDot: { width: 6, height: 6, borderRadius: 3 },
  svcKind: {
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  svcPrice: { fontSize: 18, fontWeight: "900" },
  svcPriceBig: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.9,
  },
  svcPriceUnit: {
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "800",
    textTransform: "lowercase",
  },
  svcTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginTop: 10,
  },
  svcChips: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14,
    flexWrap: "wrap",
  },
  svcChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  svcChipText: {
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: "800",
  },
  svcPerks: { marginTop: 14, gap: 8 },
  svcPerk: { flexDirection: "row", alignItems: "center", gap: 8 },
  svcPerkText: { fontSize: 12, fontWeight: "700" },
  svcFooter: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  svcSelected: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: C.lime,
    height: 42,
    borderRadius: 21,
    marginTop: -6,
  },
  svcSelectedText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  svcCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 42,
  },
  svcCtaText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },

  // Availability
  availHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  availHeadLbl: {
    color: C.ink,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  availHeadRight: { flexDirection: "row", alignItems: "baseline" },
  availHeadPrice: { color: C.ink, fontSize: 14, fontWeight: "900" },
  availHeadUnit: { color: C.mute, fontSize: 10, fontWeight: "800" },
  slot: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
  },
  slotActive: {
    backgroundColor: C.lime,
    borderColor: C.ink,
    borderWidth: 1.5,
  },
  slotTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotTime: {
    fontSize: 18,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.4,
  },
  slotTimeActive: { color: C.ink },
  slotOpen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: C.ink,
  },
  slotOpenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.lime,
  },
  slotOpenText: {
    color: C.lime,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  slotDate: {
    color: C.mute,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "900",
    marginTop: 6,
  },
  slotDateActive: { color: C.inkSoft },
  slotFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  slotMeta: { color: C.mute, fontSize: 11, fontWeight: "800" },
  slotMetaActive: { color: C.ink },
  slotDurDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.mute,
  },

  // Reviews
  reviews: {
    marginTop: 24,
    borderRadius: 26,
    backgroundColor: C.ink,
    padding: 20,
  },
  revHead: { marginBottom: 12 },
  sectionKickerDark: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "900",
    marginBottom: 4,
  },
  revTitle: {
    color: C.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  revSummary: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  revScore: {
    alignItems: "center",
    justifyContent: "center",
    width: 90,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  revScoreNum: {
    color: C.lime,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  revScoreStars: {
    flexDirection: "row",
    gap: 2,
    marginTop: 3,
  },
  revScoreLbl: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "800",
    marginTop: 4,
  },
  revBars: { flex: 1, gap: 6 },
  revRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  revStar: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "900",
    width: 8,
  },
  revTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  revFill: {
    height: "100%",
    backgroundColor: C.lime,
    borderRadius: 3,
  },
  revPct: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontWeight: "800",
    width: 32,
    textAlign: "right",
  },

  revCard: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  revUserRow: { flexDirection: "row", alignItems: "center" },
  revAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    overflow: "hidden",
  },
  revUserNameRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  revUserName: {
    color: C.white,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  revUserWhen: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontWeight: "700",
  },
  revUserHandle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
  revStars: { flexDirection: "row", gap: 2 },
  revText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 10,
  },
  revMoreBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(218,254,76,0.14)",
    borderWidth: 1,
    borderColor: C.lime,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  revMoreText: { color: C.lime, fontSize: 13, fontWeight: "900" },

  // Footer
  footer: { marginTop: 32, alignItems: "center" },
  footerText: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "800",
    color: C.mute,
  },

  // Book CTA
  bookWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  bookGlass: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1,
    borderTopColor: C.hair,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bookSummary: { flex: 1 },
  bookSumLbl: {
    color: C.mute,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  bookSumRow: { flexDirection: "row", alignItems: "baseline", marginTop: 2 },
  bookSumPrice: {
    color: C.ink,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  bookSumUnit: {
    color: C.mute,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 4,
  },
  bookBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: C.ink,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 6,
    gap: 8,
  },
  bookBtnText: {
    color: C.lime,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  bookBtnArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.inkSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.lime,
  },
});
