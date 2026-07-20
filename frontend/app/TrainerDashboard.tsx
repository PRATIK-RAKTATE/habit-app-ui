import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  StatusBar,
  Switch,
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
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

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
  hairDark: "rgba(255,255,255,0.08)",
  glass: "rgba(255,255,255,0.55)",
  glassStrong: "rgba(255,255,255,0.75)",
  lime: "#DAFE4C",
  limeDeep: "#B8E132",
  white: "#FFFFFF",
  amber: "#FFB84D",
  peach: "#FFC9A8",
  sky: "#BFE8FF",
  pink: "#F4B0FF",
  danger: "#FF6B6B",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const buzz = (kind: "light" | "medium" = "light") => {
  if (Platform.OS === "web") return;
  if (kind === "light") Haptics.selectionAsync().catch(() => {});
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

// --------------------------------------------------------------------------
// Trainer data
// --------------------------------------------------------------------------
const TRAINER = {
  name: "Kabir Nair",
  handle: "@kabirmoves",
  avatar:
    "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&q=80",
  applicationStatus: "UNDER REVIEW" as "APPROVED" | "UNDER REVIEW" | "REJECTED",
  applicationStep: 2, // 0-3
  applicationSteps: ["Submitted", "KYC verified", "Under review", "Approved"],
  specialization: "HIIT · Conditioning",
  experience: 6, // years
  bio:
    "Ex-college athlete turned coach. Building programmes that fit around real life — 20-minute finishers to 90-minute strength blocks.",
  availability: "Mon–Sat · 6:00–22:00",
  languages: ["English", "Hindi", "Marathi"],
  hourlyRate: 1200, // INR
  readiness: 0.76, // 0..1
  ratingScore: 4.8,
  ratingCount: 128,
  services: 4,
  scheduledThisWeek: 12,
  slotsOpen: 9,
  weekLoad: [0.4, 0.7, 0.55, 0.9, 0.35, 0.8, 0.25], // Mon-Sun
  bookedDays: [0, 1, 3, 5], // indexes
};

// --------------------------------------------------------------------------
// Ambient background
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
          { position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          ring,
        ]}
      />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </View>
  );
}

// --------------------------------------------------------------------------
// Progress ring (pure View — no SVG)
// --------------------------------------------------------------------------
function ProgressRing({
  size = 84,
  stroke = 8,
  progress = 0.76,
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
        style={[halfBase, { transform: [{ rotate: "-45deg" }, { rotate: `${half1Deg}deg` }] }]}
      />
      {clamped > 0.5 && (
        <View
          style={[halfBase, { transform: [{ rotate: "-45deg" }, { rotate: `${180 + half2Deg}deg` }] }]}
        />
      )}
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        {children}
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Sticky Header
// --------------------------------------------------------------------------
function Header({ scrollY }: { scrollY: Animated.SharedValue<number> }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const glass = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]} testID="dash-header">
      <Animated.View style={[StyleSheet.absoluteFill, glass]}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.headerHair} />
      </Animated.View>
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} testID="back-btn">
          <Feather name="arrow-left" size={18} color={C.lime} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerHello}>◇ TRAINER STUDIO</Text>
          <Text style={styles.headerTitle}>Dashboard</Text>
        </View>
        <Pressable style={styles.headerIcon} testID="help-btn">
          <Feather name="help-circle" size={18} color={C.ink} />
        </Pressable>
        <Pressable style={[styles.headerIcon, { marginLeft: 10 }]} testID="notif-btn">
          <Ionicons name="notifications-outline" size={18} color={C.ink} />
          <View style={styles.headerIconDot} />
        </Pressable>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Profile Hero (dark editorial card with avatar + meta)
// --------------------------------------------------------------------------
function ProfileHero() {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.hero} testID="profile-hero">
      {/* Giant initial backdrop */}
      <Text style={styles.bigInitial} pointerEvents="none">
        K
      </Text>
      {/* Sideways ticker */}
      <View style={styles.heroTicker}>
        <Text style={styles.heroTickerText}>◇ ATHLETE COACH  ◇ ATHLETE COACH</Text>
      </View>

      {/* Top row: status + edit */}
      <View style={styles.heroTop}>
        <View style={styles.statusPill}>
          <PulseDot color={C.lime} size={6} />
          <Text style={styles.statusPillText}>{TRAINER.applicationStatus}</Text>
        </View>
        <Pressable style={styles.editBtn} onPress={buzz} testID="edit-profile-btn">
          <Feather name="edit-3" size={12} color={C.lime} />
          <Text style={styles.editBtnText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.heroBody}>
        {/* Avatar + name column */}
        <View style={styles.heroAvatarWrap}>
          <View style={styles.heroAvatarRing} />
          <View style={styles.heroAvatarInner}>
            <Image source={TRAINER.avatar} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
          </View>
          <View style={styles.heroAvatarBadge}>
            <Ionicons name="checkmark" size={10} color={C.ink} />
          </View>
        </View>

        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.heroName}>{TRAINER.name}</Text>
          <Text style={styles.heroHandle}>{TRAINER.handle}</Text>
          <View style={styles.heroChipsRow}>
            <View style={[styles.chip, styles.chipLime]}>
              <View style={styles.chipDotDark} />
              <Text style={styles.chipTextDark}>{TRAINER.specialization}</Text>
            </View>
            <View style={styles.chip}>
              <Ionicons name="ribbon-outline" size={11} color={C.lime} />
              <Text style={styles.chipText}>{TRAINER.experience} yrs</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bio */}
      <Text style={styles.heroBio} numberOfLines={3}>
        {TRAINER.bio}
      </Text>

      {/* Meta pills row */}
      <View style={styles.heroMetaRow}>
        <View style={styles.metaTile}>
          <Ionicons name="time-outline" size={12} color={C.lime} />
          <Text style={styles.metaTileLbl}>AVAILABILITY</Text>
          <Text style={styles.metaTileVal}>{TRAINER.availability}</Text>
        </View>
        <View style={styles.metaTile}>
          <Ionicons name="language-outline" size={12} color={C.lime} />
          <Text style={styles.metaTileLbl}>LANGUAGES</Text>
          <Text style={styles.metaTileVal} numberOfLines={1}>
            {TRAINER.languages.join(" · ")}
          </Text>
        </View>
        <View style={[styles.metaTile, styles.metaTileLime]}>
          <Ionicons name="pricetag-outline" size={12} color={C.ink} />
          <Text style={[styles.metaTileLbl, { color: C.ink }]}>RATE</Text>
          <Text style={[styles.metaTileVal, { color: C.ink }]}>
            ₹ {TRAINER.hourlyRate}
            <Text style={styles.metaTileValUnit}> /hr</Text>
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Application banner (progress stepper card)
// --------------------------------------------------------------------------
function ApplicationBanner() {
  const step = TRAINER.applicationStep;
  const steps = TRAINER.applicationSteps;
  const totalDone = step + 1;
  const pct = totalDone / steps.length;
  const barVal = useSharedValue(0);
  useEffect(() => {
    barVal.value = withTiming(pct, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [pct, barVal]);
  const barStyle = useAnimatedStyle(() => ({ width: `${barVal.value * 100}%` }));

  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(80)}
      style={styles.banner}
      testID="app-banner"
    >
      <View style={styles.bannerTop}>
        <View style={styles.bannerBadge}>
          <View style={styles.bannerBadgeDot} />
          <Text style={styles.bannerBadgeText}>APPLICATION</Text>
        </View>
        <Text style={styles.bannerETA}>ETA · 24–48 hrs</Text>
      </View>
      <Text style={styles.bannerTitle}>
        You&apos;re {steps.length - totalDone} step away from being live.
      </Text>

      {/* Stepper track */}
      <View style={styles.stepper}>
        <View style={styles.stepperTrack}>
          <Animated.View style={[styles.stepperFill, barStyle]} />
        </View>
        <View style={styles.stepperDots}>
          {steps.map((_, i) => {
            const done = i <= step;
            return (
              <View
                key={i}
                style={[styles.stepDot, done && styles.stepDotOn, i === step && styles.stepDotActive]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={10} color={C.ink} />
                ) : (
                  <Text style={styles.stepDotIdx}>{i + 1}</Text>
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.stepperLabels}>
          {steps.map((s, i) => (
            <Text
              key={i}
              style={[styles.stepLbl, i <= step && styles.stepLblOn]}
              numberOfLines={1}
            >
              {s}
            </Text>
          ))}
        </View>
      </View>

      <Pressable style={styles.bannerCta} onPress={buzz} testID="track-app-btn">
        <Text style={styles.bannerCtaText}>Track application</Text>
        <View style={styles.bannerCtaArrow}>
          <Feather name="arrow-up-right" size={16} color={C.lime} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Quick links grid
// --------------------------------------------------------------------------
const QUICK_LINKS = [
  { key: "sessions", label: "Sessions", sub: "12 this week", icon: "calendar-outline" as const, color: C.ink, fg: C.lime },
  { key: "students", label: "Students", sub: "34 active", icon: "people-outline" as const, color: C.white, fg: C.ink },
  { key: "payouts", label: "Payouts", sub: "₹ 48,200", icon: "cash-outline" as const, color: C.lime, fg: C.ink },
  { key: "messages", label: "Inbox", sub: "3 new", icon: "chatbubbles-outline" as const, color: C.white, fg: C.ink },
];

function QuickLinks() {
  return (
    <View style={styles.quickWrap} testID="quick-links">
      {QUICK_LINKS.map((q, i) => (
        <AnimatedPressable
          key={q.key}
          entering={FadeInDown.duration(400).delay(80 + i * 60)}
          onPress={buzz}
          style={[styles.quickCard, { backgroundColor: q.color }]}
          testID={`quick-${q.key}`}
        >
          <View
            style={[
              styles.quickIcon,
              {
                backgroundColor:
                  q.color === C.white ? C.bgSoft : "rgba(255,255,255,0.14)",
              },
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
                  q.color === C.ink
                    ? "rgba(255,255,255,0.55)"
                    : q.color === C.lime
                    ? C.inkSoft
                    : C.mute,
              },
            ]}
          >
            {q.sub}
          </Text>
          <View
            style={[
              styles.quickArrow,
              { backgroundColor: q.color === C.white ? C.ink : "rgba(0,0,0,0.15)" },
            ]}
          >
            <Feather
              name="arrow-up-right"
              size={12}
              color={q.color === C.white ? C.lime : C.white}
            />
          </View>
        </AnimatedPressable>
      ))}
    </View>
  );
}

// --------------------------------------------------------------------------
// PROFILE SNAPSHOT — creative custom shapes for each stat
// --------------------------------------------------------------------------

// 1. Services — stacked "receipt" style card
function ServicesTile() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(60)}
      style={[styles.tile, styles.tileLight]}
      testID="stat-services"
    >
      <View style={styles.tileHead}>
        <Text style={styles.tileKicker}>◇ SERVICES</Text>
        <View style={styles.tileTag}>
          <Text style={styles.tileTagText}>ACTIVE</Text>
        </View>
      </View>
      <Text style={styles.tileBigNum}>{TRAINER.services}</Text>
      <Text style={styles.tileSub}>packages live</Text>

      {/* Receipt-style stacked strips */}
      <View style={styles.receiptWrap}>
        {[
          { name: "Private HIIT", price: 1200 },
          { name: "Group Blast", price: 750 },
          { name: "Home coaching", price: 950 },
        ].map((s, i) => (
          <View key={i} style={styles.receiptRow}>
            <View style={styles.receiptBullet} />
            <Text style={styles.receiptName} numberOfLines={1}>
              {s.name}
            </Text>
            <Text style={styles.receiptPrice}>₹{s.price}</Text>
          </View>
        ))}
        <View style={styles.receiptTearBar} />
      </View>
    </Animated.View>
  );
}

// 2. Schedule — 7-day mini bar chart with booked-day markers
function ScheduleTile() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(120)}
      style={[styles.tile, styles.tileDark]}
      testID="stat-schedule"
    >
      <View style={styles.tileHead}>
        <Text style={[styles.tileKicker, { color: C.lime }]}>◇ SCHEDULE</Text>
        <View style={[styles.tileTag, { backgroundColor: C.lime }]}>
          <Text style={[styles.tileTagText, { color: C.ink }]}>WEEK</Text>
        </View>
      </View>
      <Text style={[styles.tileBigNum, { color: C.white }]}>
        {TRAINER.scheduledThisWeek}
      </Text>
      <Text style={[styles.tileSub, { color: "rgba(255,255,255,0.55)" }]}>
        sessions booked
      </Text>

      <View style={styles.weekBars}>
        {TRAINER.weekLoad.map((v, i) => {
          const isBooked = TRAINER.bookedDays.includes(i);
          return (
            <View key={i} style={styles.weekCol}>
              <View style={styles.weekBarTrack}>
                <View
                  style={[
                    styles.weekBarFill,
                    {
                      height: `${v * 100}%`,
                      backgroundColor: isBooked ? C.lime : "rgba(255,255,255,0.25)",
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.weekDay,
                  { color: isBooked ? C.lime : "rgba(255,255,255,0.35)" },
                ]}
              >
                {days[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

// 3. Rating — half-moon "gauge" shape
function RatingTile() {
  const pct = TRAINER.ratingScore / 5;
  const val = useSharedValue(0);
  useEffect(() => {
    val.value = withTiming(pct, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [pct, val]);
  const needle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(val.value, [0, 1], [-90, 90])}deg` }],
  }));
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(180)}
      style={[styles.tile, styles.tileLight]}
      testID="stat-rating"
    >
      <View style={styles.tileHead}>
        <Text style={styles.tileKicker}>◇ RATING</Text>
        <View style={styles.tileTag}>
          <Ionicons name="star" size={10} color={C.amber} />
          <Text style={styles.tileTagText}> TOP 5%</Text>
        </View>
      </View>

      {/* Half-moon gauge */}
      <View style={styles.gaugeWrap}>
        <View style={styles.gaugeTrack} />
        {/* Colored fill (using overflow trick) */}
        <View style={styles.gaugeFillMask}>
          <View style={styles.gaugeFillArc} />
        </View>
        {/* Needle */}
        <Animated.View style={[styles.gaugeNeedleWrap, needle]}>
          <View style={styles.gaugeNeedle} />
          <View style={styles.gaugeNeedleTip} />
        </Animated.View>
        <View style={styles.gaugeCenter} />
        {/* Value */}
        <View style={styles.gaugeValueBox}>
          <Text style={styles.gaugeValue}>{TRAINER.ratingScore}</Text>
          <Text style={styles.gaugeValueUnit}>/5</Text>
        </View>
      </View>

      <View style={styles.tileFootRow}>
        <View style={styles.tileFootTag}>
          <Ionicons name="chatbubble-outline" size={10} color={C.ink} />
          <Text style={styles.tileFootTagText}>{TRAINER.ratingCount} reviews</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// 4. Application status — mini vertical stepper card
function AppStatusTile() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(240)}
      style={[styles.tile, styles.tileDark]}
      testID="stat-application"
    >
      <View style={styles.tileHead}>
        <Text style={[styles.tileKicker, { color: C.lime }]}>◇ STATUS</Text>
        <View style={styles.appDot}>
          <PulseDot color={C.lime} size={5} />
          <Text style={styles.appDotText}>LIVE</Text>
        </View>
      </View>
      <Text style={[styles.tileBigNum, { color: C.white, fontSize: 22 }]}>
        Under Review
      </Text>
      <Text style={[styles.tileSub, { color: "rgba(255,255,255,0.55)" }]}>
        step {TRAINER.applicationStep + 1} of {TRAINER.applicationSteps.length}
      </Text>

      <View style={styles.miniStepper}>
        {TRAINER.applicationSteps.map((s, i) => {
          const done = i <= TRAINER.applicationStep;
          return (
            <View key={i} style={styles.miniStep}>
              <View
                style={[
                  styles.miniStepDot,
                  { backgroundColor: done ? C.lime : "rgba(255,255,255,0.15)" },
                ]}
              />
              {i < TRAINER.applicationSteps.length - 1 && (
                <View
                  style={[
                    styles.miniStepLine,
                    {
                      backgroundColor:
                        i < TRAINER.applicationStep ? C.lime : "rgba(255,255,255,0.15)",
                    },
                  ]}
                />
              )}
              <Text
                style={[
                  styles.miniStepText,
                  {
                    color: done ? C.white : "rgba(255,255,255,0.4)",
                    fontWeight: i === TRAINER.applicationStep ? "900" : "700",
                  },
                ]}
                numberOfLines={1}
              >
                {s}
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

// 5. Availability slot — clock-dial style shape
function AvailabilityTile() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(300)}
      style={[styles.tile, styles.tileLight]}
      testID="stat-availability"
    >
      <View style={styles.tileHead}>
        <Text style={styles.tileKicker}>◇ SLOTS</Text>
        <View style={[styles.tileTag, styles.tileTagLime]}>
          <View style={styles.limeDotSm} />
          <Text style={[styles.tileTagText, { color: C.ink }]}>OPEN</Text>
        </View>
      </View>
      <Text style={styles.tileBigNum}>{TRAINER.slotsOpen}</Text>
      <Text style={styles.tileSub}>open this week</Text>

      {/* Clock dial */}
      <View style={styles.clockWrap}>
        <View style={styles.clockOuter} />
        {/* 12 ticks */}
        {Array.from({ length: 12 }).map((_, i) => {
          const isMain = i % 3 === 0;
          const angle = (i / 12) * 360;
          return (
            <View
              key={i}
              style={[
                styles.clockTick,
                {
                  height: isMain ? 10 : 5,
                  width: isMain ? 3 : 2,
                  backgroundColor: isMain ? C.ink : C.mute,
                  transform: [{ rotate: `${angle}deg` }, { translateY: -46 }],
                },
              ]}
            />
          );
        })}
        {/* Filled arc via 3 blocks placed on ring positions */}
        {[0, 1, 2, 3, 5].map((slot) => {
          const angle = (slot / 12) * 360;
          return (
            <View
              key={slot}
              style={[
                styles.clockSlot,
                { transform: [{ rotate: `${angle}deg` }, { translateY: -46 }] },
              ]}
            />
          );
        })}
        {/* Center hub */}
        <View style={styles.clockCenter}>
          <Text style={styles.clockCenterText}>NOW</Text>
          <Text style={styles.clockCenterSub}>18:00</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// 6. Profile readiness — circular ring w/ checklist stubs
function ReadinessTile() {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(360)}
      style={[styles.tile, styles.tileLime]}
      testID="stat-readiness"
    >
      <View style={styles.tileHead}>
        <Text style={[styles.tileKicker, { color: C.ink }]}>◇ READINESS</Text>
        <View style={[styles.tileTag, { backgroundColor: C.ink }]}>
          <Text style={[styles.tileTagText, { color: C.lime }]}>NEARLY</Text>
        </View>
      </View>

      <View style={styles.readyRow}>
        <ProgressRing
          size={72}
          stroke={8}
          progress={TRAINER.readiness}
          track="rgba(10,10,10,0.14)"
          fill={C.ink}
        >
          <Text style={styles.readyPct}>{Math.round(TRAINER.readiness * 100)}%</Text>
        </ProgressRing>

        <View style={styles.readyChecklist}>
          {[
            { l: "Profile", ok: true },
            { l: "ID verified", ok: true },
            { l: "First service", ok: true },
            { l: "Bank details", ok: false },
          ].map((it, i) => (
            <View key={i} style={styles.readyItem}>
              <View
                style={[styles.readyDot, { backgroundColor: it.ok ? C.ink : "rgba(10,10,10,0.15)" }]}
              >
                {it.ok && <Ionicons name="checkmark" size={9} color={C.lime} />}
              </View>
              <Text
                style={[
                  styles.readyLbl,
                  { color: it.ok ? C.ink : C.mute, fontWeight: it.ok ? "900" : "700" },
                ]}
              >
                {it.l}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Next-step guidance
// --------------------------------------------------------------------------
const NEXT_STEPS = [
  {
    id: "n1",
    kicker: "STEP 01",
    title: "Add your bank details",
    sub: "So we can process payouts starting Friday",
    icon: "cash-outline" as const,
    cta: "Add now",
  },
  {
    id: "n2",
    kicker: "STEP 02",
    title: "Upload a portrait photo",
    sub: "Studio-quality photo increases bookings by ~30%",
    icon: "camera-outline" as const,
    cta: "Upload",
  },
  {
    id: "n3",
    kicker: "STEP 03",
    title: "Set your first 14 slots",
    sub: "Availability lands you higher in search",
    icon: "calendar-outline" as const,
    cta: "Open calendar",
  },
];

function NextSteps() {
  return (
    <View style={{ paddingHorizontal: 20 }} testID="next-steps">
      {NEXT_STEPS.map((n, i) => (
        <Animated.View
          key={n.id}
          entering={FadeInDown.duration(400).delay(80 * i)}
          style={styles.step}
        >
          <View style={styles.stepIcon}>
            <Ionicons name={n.icon} size={18} color={C.ink} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={styles.stepKickerRow}>
              <Text style={styles.stepKicker}>◇ {n.kicker}</Text>
              <View style={styles.stepIdx}>
                <Text style={styles.stepIdxText}>
                  0{i + 1}
                  <Text style={styles.stepIdxTotal}>
                    {" "}/ 0{NEXT_STEPS.length}
                  </Text>
                </Text>
              </View>
            </View>
            <Text style={styles.stepTitle}>{n.title}</Text>
            <Text style={styles.stepSub}>{n.sub}</Text>
          </View>
          <Pressable style={styles.stepCta} onPress={buzz} testID={`next-${n.id}`}>
            <Text style={styles.stepCtaText}>{n.cta}</Text>
            <Feather name="arrow-right" size={12} color={C.lime} />
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

// --------------------------------------------------------------------------
// Settings panel
// --------------------------------------------------------------------------
function Settings() {
  const [pushOn, setPushOn] = useState(true);
  const [availOn, setAvailOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);

  const rows: {
    key: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    hint?: string;
    right: React.ReactNode;
  }[] = [
    {
      key: "push",
      icon: "notifications-outline",
      label: "Push notifications",
      hint: "New bookings & messages",
      right: (
        <Switch
          value={pushOn}
          onValueChange={(v) => {
            buzz();
            setPushOn(v);
          }}
          trackColor={{ true: C.lime, false: C.hair }}
          thumbColor={C.ink}
          testID="settings-push"
        />
      ),
    },
    {
      key: "avail",
      icon: "toggle-outline",
      label: "Accept new bookings",
      hint: "Turn off to pause my profile",
      right: (
        <Switch
          value={availOn}
          onValueChange={(v) => {
            buzz();
            setAvailOn(v);
          }}
          trackColor={{ true: C.lime, false: C.hair }}
          thumbColor={C.ink}
          testID="settings-avail"
        />
      ),
    },
    {
      key: "sms",
      icon: "chatbubble-outline",
      label: "SMS receipts",
      hint: "For every payout",
      right: (
        <Switch
          value={smsOn}
          onValueChange={(v) => {
            buzz();
            setSmsOn(v);
          }}
          trackColor={{ true: C.lime, false: C.hair }}
          thumbColor={C.ink}
          testID="settings-sms"
        />
      ),
    },
    {
      key: "payout",
      icon: "cash-outline",
      label: "Payout method",
      hint: "Bank account · **** 4412",
      right: (
        <Feather name="chevron-right" size={16} color={C.mute} />
      ),
    },
    {
      key: "help",
      icon: "help-circle-outline",
      label: "Help & support",
      right: <Feather name="chevron-right" size={16} color={C.mute} />,
    },
    {
      key: "logout",
      icon: "log-out-outline",
      label: "Sign out",
      right: <Feather name="chevron-right" size={16} color={C.danger} />,
    },
  ];

  return (
    <View style={styles.settings} testID="settings-panel">
      {rows.map((r, i) => (
        <View key={r.key}>
          <Pressable style={styles.settingsRow} onPress={buzz} testID={`settings-row-${r.key}`}>
            <View style={[
              styles.settingsIcon,
              r.key === "logout" && { backgroundColor: "rgba(255,107,107,0.1)" },
            ]}>
              <Ionicons
                name={r.icon}
                size={16}
                color={r.key === "logout" ? C.danger : C.ink}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                style={[
                  styles.settingsLbl,
                  r.key === "logout" && { color: C.danger },
                ]}
              >
                {r.label}
              </Text>
              {r.hint && <Text style={styles.settingsHint}>{r.hint}</Text>}
            </View>
            {r.right}
          </Pressable>
          {i < rows.length - 1 && <View style={styles.settingsDiv} />}
        </View>
      ))}
    </View>
  );
}

// --------------------------------------------------------------------------
// Screen
// --------------------------------------------------------------------------
export default function TrainerDashboard() {
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
        testID="dash-scroll"
      >
        <View style={{ height: 96 }} />

        <View style={styles.pageBlock}>
          <ProfileHero />
        </View>

        <View style={styles.pageBlock}>
          <ApplicationBanner />
        </View>

        {/* Quick links */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ QUICK LINKS</Text>
            <Text style={styles.sectionTitle}>Jump right in</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="all-links">
            <Text style={styles.sectionBtnText}>All</Text>
            <Feather name="arrow-right" size={14} color={C.ink} />
          </Pressable>
        </View>
        <View style={styles.pageBlock}>
          <QuickLinks />
        </View>

        {/* Profile snapshot */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ SNAPSHOT</Text>
            <Text style={styles.sectionTitle}>Profile snapshot</Text>
          </View>
          <Text style={styles.sectionHint}>updated · a minute ago</Text>
        </View>
        <View style={styles.pageBlock}>
          <View style={styles.tileGrid}>
            <ServicesTile />
            <ScheduleTile />
            <RatingTile />
            <AppStatusTile />
            <AvailabilityTile />
            <ReadinessTile />
          </View>
        </View>

        {/* Next steps */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ WHAT&apos;S NEXT</Text>
            <Text style={styles.sectionTitle}>Next steps</Text>
          </View>
          <Pressable style={styles.sectionBtn} onPress={buzz} testID="skip-onboard">
            <Text style={styles.sectionBtnText}>Skip</Text>
          </Pressable>
        </View>
        <NextSteps />

        {/* Settings */}
        <View style={styles.sectionHead}>
          <View>
            <Text style={styles.sectionKicker}>◇ CONTROLS</Text>
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>
        </View>
        <View style={styles.pageBlock}>
          <Settings />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>◇ habit101 · trainer studio v1.0 ◇</Text>
        </View>
        <View style={{ height: 60 }} />
      </Animated.ScrollView>

      <Header scrollY={scrollY} />
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
    fontSize: 10,
    color: C.limeDeep,
    letterSpacing: 2,
    fontWeight: "900",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.6,
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
  hero: {
    borderRadius: 28,
    backgroundColor: C.ink,
    padding: 20,
    overflow: "hidden",
  },
  bigInitial: {
    position: "absolute",
    right: -20,
    top: -50,
    fontSize: 260,
    fontWeight: "900",
    color: C.lime,
    opacity: 0.1,
    letterSpacing: -10,
  },
  heroTicker: {
    position: "absolute",
    top: 20,
    right: -30,
    transform: [{ rotate: "90deg" }],
    opacity: 0.5,
  },
  heroTickerText: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 6,
    fontWeight: "800",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(218,254,76,0.14)",
    borderWidth: 1,
    borderColor: C.lime,
  },
  statusPillText: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "900",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: C.hairDark,
  },
  editBtnText: {
    color: C.lime,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  heroBody: { flexDirection: "row", alignItems: "center" },
  heroAvatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  heroAvatarRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 38,
    backgroundColor: C.lime,
  },
  heroAvatarInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: C.ink,
  },
  heroAvatarBadge: {
    position: "absolute",
    right: -2,
    bottom: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.lime,
    borderWidth: 2,
    borderColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  heroName: {
    color: C.white,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  heroHandle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  heroChipsRow: { flexDirection: "row", gap: 6, marginTop: 10, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: C.hairDark,
  },
  chipText: { color: C.white, fontSize: 10, letterSpacing: 0.4, fontWeight: "800" },
  chipLime: { backgroundColor: C.lime, borderColor: C.lime },
  chipDotDark: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.ink },
  chipTextDark: { color: C.ink, fontSize: 10, letterSpacing: 0.4, fontWeight: "900" },

  heroBio: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 14,
  },

  heroMetaRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 8,
  },
  metaTile: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: C.hairDark,
  },
  metaTileLime: {
    backgroundColor: C.lime,
    borderColor: C.lime,
  },
  metaTileLbl: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    letterSpacing: 1.3,
    fontWeight: "900",
    marginTop: 5,
  },
  metaTileVal: {
    color: C.white,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: -0.2,
    marginTop: 2,
  },
  metaTileValUnit: {
    color: "rgba(10,10,10,0.55)",
    fontSize: 10,
    fontWeight: "800",
  },

  // Application banner
  banner: {
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    padding: 18,
  },
  bannerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bannerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: C.ink,
  },
  bannerBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  bannerBadgeText: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "900",
  },
  bannerETA: {
    color: C.mute,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  bannerTitle: {
    fontSize: 20,
    color: C.ink,
    fontWeight: "900",
    letterSpacing: -0.6,
    marginTop: 10,
    lineHeight: 26,
  },

  // Stepper
  stepper: { marginTop: 18 },
  stepperTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: C.bgSoft,
    overflow: "hidden",
  },
  stepperFill: {
    height: "100%",
    backgroundColor: C.lime,
    borderRadius: 3,
  },
  stepperDots: {
    marginTop: -14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.hair,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -8,
  },
  stepDotOn: {
    backgroundColor: C.lime,
    borderColor: C.ink,
  },
  stepDotActive: {
    borderColor: C.ink,
    borderWidth: 2,
    transform: [{ scale: 1.1 }],
  },
  stepDotIdx: { fontSize: 10, fontWeight: "900", color: C.mute },
  stepperLabels: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepLbl: {
    fontSize: 9,
    letterSpacing: 0.5,
    fontWeight: "700",
    color: C.mute,
    flex: 1,
    textAlign: "center",
  },
  stepLblOn: { color: C.ink, fontWeight: "900" },

  bannerCta: {
    marginTop: 18,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.ink,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 6,
    justifyContent: "space-between",
  },
  bannerCtaText: {
    color: C.lime,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  bannerCtaArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
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

  // Quick links
  quickWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: "48%",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: C.hair,
    position: "relative",
  },
  quickIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickLabel: { fontSize: 17, fontWeight: "900", letterSpacing: -0.4 },
  quickSub: { fontSize: 11, fontWeight: "700", marginTop: 3 },
  quickArrow: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  // Tile grid
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tile: {
    width: "48%",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    minHeight: 220,
    overflow: "hidden",
  },
  tileLight: { backgroundColor: C.white, borderColor: C.hair },
  tileDark: { backgroundColor: C.ink, borderColor: C.ink },
  tileLime: { backgroundColor: C.lime, borderColor: C.lime },
  tileHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tileKicker: {
    color: C.limeDeep,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  tileTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: C.bgSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tileTagLime: { backgroundColor: C.lime },
  tileTagText: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "900",
    color: C.mute,
  },
  tileBigNum: {
    fontSize: 44,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -1.5,
    marginTop: 6,
  },
  tileSub: {
    fontSize: 11,
    color: C.mute,
    letterSpacing: 0.4,
    fontWeight: "800",
  },
  tileFootRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  tileFootTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: C.bg,
  },
  tileFootTagText: { fontSize: 9, letterSpacing: 0.8, fontWeight: "800" },

  // Services receipt
  receiptWrap: {
    marginTop: 12,
    padding: 8,
    borderRadius: 12,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.hair,
    borderStyle: "dashed",
  },
  receiptRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    gap: 6,
  },
  receiptBullet: {
    width: 5,
    height: 5,
    backgroundColor: C.ink,
    borderRadius: 2.5,
  },
  receiptName: {
    flex: 1,
    fontSize: 10,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.1,
  },
  receiptPrice: { fontSize: 10, fontWeight: "900", color: C.limeDeep },
  receiptTearBar: {
    marginTop: 4,
    marginHorizontal: -8,
    height: 4,
    backgroundColor: "transparent",
    borderTopWidth: 1.5,
    borderTopColor: C.hair,
    borderStyle: "dashed",
  },

  // Week bars
  weekBars: {
    marginTop: 12,
    flexDirection: "row",
    height: 68,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  weekCol: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" },
  weekBarTrack: {
    width: 8,
    height: 50,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  weekBarFill: {
    width: "100%",
    borderRadius: 4,
  },
  weekDay: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginTop: 6,
  },

  // Gauge (rating)
  gaugeWrap: {
    height: 92,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  gaugeTrack: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderColor: C.bgSoft,
    bottom: -65,
  },
  gaugeFillMask: {
    position: "absolute",
    width: 130,
    height: 65,
    bottom: 0,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  gaugeFillArc: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 10,
    borderColor: "transparent",
    borderTopColor: C.lime,
    borderRightColor: C.lime,
    borderLeftColor: C.amber,
    transform: [{ rotate: "-45deg" }],
  },
  gaugeNeedleWrap: {
    position: "absolute",
    bottom: 0,
    width: 4,
    height: 60,
    alignItems: "center",
  },
  gaugeNeedle: {
    width: 3,
    flex: 1,
    backgroundColor: C.ink,
    borderRadius: 2,
  },
  gaugeNeedleTip: {
    position: "absolute",
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.lime,
    borderWidth: 1.5,
    borderColor: C.ink,
  },
  gaugeCenter: {
    position: "absolute",
    bottom: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.ink,
    borderWidth: 2,
    borderColor: C.lime,
  },
  gaugeValueBox: {
    position: "absolute",
    bottom: -4,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginTop: 6,
  },
  gaugeValue: {
    fontSize: 22,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.6,
  },
  gaugeValueUnit: {
    fontSize: 10,
    fontWeight: "800",
    color: C.mute,
    marginLeft: 1,
  },

  // App status
  appDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  appDotText: {
    color: C.lime,
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: "900",
  },
  miniStepper: {
    marginTop: 12,
    gap: 4,
  },
  miniStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "relative",
    height: 22,
  },
  miniStepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniStepLine: {
    position: "absolute",
    left: 3,
    top: 12,
    width: 2,
    height: 12,
  },
  miniStepText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },

  // Clock
  clockWrap: {
    marginTop: 12,
    width: 120,
    height: 120,
    alignSelf: "center",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  clockOuter: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: C.hair,
  },
  clockTick: {
    position: "absolute",
    borderRadius: 2,
  },
  clockSlot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.lime,
    borderWidth: 1.5,
    borderColor: C.ink,
  },
  clockCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  clockCenterText: {
    color: C.lime,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "900",
  },
  clockCenterSub: {
    color: C.white,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 2,
  },

  // Readiness
  limeDotSm: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.ink },
  readyRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  readyPct: {
    fontSize: 16,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.5,
  },
  readyChecklist: {
    flex: 1,
    gap: 6,
  },
  readyItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  readyDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  readyLbl: {
    fontSize: 11,
    letterSpacing: -0.1,
  },

  // Steps
  step: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    marginBottom: 10,
  },
  stepIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.lime,
    justifyContent: "center",
    alignItems: "center",
  },
  stepKickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepKicker: {
    color: C.limeDeep,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  stepIdx: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: C.bgSoft,
  },
  stepIdxText: { fontSize: 9, color: C.ink, fontWeight: "900", letterSpacing: 0.8 },
  stepIdxTotal: { color: C.mute, fontWeight: "700" },
  stepTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
    marginTop: 3,
  },
  stepSub: { fontSize: 11, color: C.mute, fontWeight: "700", marginTop: 2 },
  stepCta: {
    marginLeft: 8,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: C.ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  stepCtaText: {
    fontSize: 11,
    color: C.lime,
    fontWeight: "900",
    letterSpacing: -0.1,
  },

  // Settings
  settings: {
    borderRadius: 22,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    padding: 8,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
  },
  settingsIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.bgSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsLbl: {
    fontSize: 13,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.2,
  },
  settingsHint: {
    fontSize: 11,
    color: C.mute,
    fontWeight: "700",
    marginTop: 2,
  },
  settingsDiv: {
    height: 1,
    backgroundColor: C.hair,
    marginHorizontal: 12,
  },

  // Footer
  footer: { marginTop: 32, alignItems: "center" },
  footerText: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "800",
    color: C.mute,
  },
});
