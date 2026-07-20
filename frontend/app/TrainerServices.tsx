import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  StatusBar,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
// Tokens
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
  ok: "#7EE787",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const buzz = (kind: "light" | "medium" = "light") => {
  if (Platform.OS === "web") return;
  if (kind === "light") Haptics.selectionAsync().catch(() => {});
  else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
};

// --------------------------------------------------------------------------
// Data
// --------------------------------------------------------------------------
const DIFFICULTIES = ["Beginner", "Balanced", "Advanced", "Elite"] as const;
const SESSION_TYPES = ["Online", "In-person", "Hybrid"] as const;
const CURRENCIES = ["INR", "USD", "AED"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];
type SessionType = (typeof SESSION_TYPES)[number];
type Currency = (typeof CURRENCIES)[number];

type PublicService = {
  id: string;
  label: "FEATURED" | "WEEKLY PLAN" | "STARTER";
  price: number;
  currency: Currency;
  billing: string;
  name: string;
  description: string;
  duration: number; // minutes
  capacity: number | "1-on-1";
  sessionType: SessionType;
  difficulty: Difficulty;
  outcomes: string[];
  equipment: string[];
};

const PUBLIC_SERVICES: PublicService[] = [
  {
    id: "p1",
    label: "FEATURED",
    price: 22400,
    currency: "INR",
    billing: "monthly",
    name: "Private HIIT Coaching",
    description:
      "One-to-one, high-intensity conditioning tuned to your goal, schedule and equipment.",
    duration: 60,
    capacity: "1-on-1",
    sessionType: "Hybrid",
    difficulty: "Advanced",
    outcomes: ["Fat loss", "Endurance", "Strength foundation"],
    equipment: ["Kettlebell", "Mat", "Bands"],
  },
  {
    id: "p2",
    label: "WEEKLY PLAN",
    price: 4900,
    currency: "INR",
    billing: "weekly",
    name: "Group Blast",
    description:
      "Small-group circuits with pacing music, mobility warm-ups and squad accountability.",
    duration: 45,
    capacity: 8,
    sessionType: "In-person",
    difficulty: "Balanced",
    outcomes: ["Cardio", "Community", "Consistency"],
    equipment: ["Dumbbells", "Mat"],
  },
  {
    id: "p3",
    label: "STARTER",
    price: 3500,
    currency: "INR",
    billing: "one-time",
    name: "Home Coaching · 4 sessions",
    description:
      "Get set up at home with a bespoke programme and 4 video sessions to lock in form.",
    duration: 40,
    capacity: "1-on-1",
    sessionType: "Online",
    difficulty: "Beginner",
    outcomes: ["Form", "Habit", "Baseline"],
    equipment: ["None"],
  },
];

type ManagePlan = {
  id: string;
  name: string;
  type: "Subscription" | "One-time" | "Package";
  sessions: number;
  discount: number; // %
  price: number;
};

type ManageService = {
  id: string;
  status: "ACTIVE" | "PAUSED" | "DRAFT";
  name: string;
  description: string;
  duration: number;
  sessionType: SessionType;
  plans: ManagePlan[];
};

const MANAGE_SERVICES: ManageService[] = [
  {
    id: "m1",
    status: "ACTIVE",
    name: "Private HIIT Coaching",
    description: "One-to-one high-intensity conditioning tailored to your goal.",
    duration: 60,
    sessionType: "Hybrid",
    plans: [
      { id: "pl1", name: "Monthly", type: "Subscription", sessions: 8, discount: 0, price: 22400 },
      { id: "pl2", name: "Quarterly", type: "Subscription", sessions: 24, discount: 15, price: 57120 },
      { id: "pl3", name: "Trial pack", type: "Package", sessions: 3, discount: 40, price: 4200 },
    ],
  },
  {
    id: "m2",
    status: "PAUSED",
    name: "Group Blast",
    description: "Small-group circuits with pacing music and mobility warm-ups.",
    duration: 45,
    sessionType: "In-person",
    plans: [
      { id: "pl4", name: "Weekly drop-in", type: "One-time", sessions: 1, discount: 0, price: 750 },
      { id: "pl5", name: "10-pack", type: "Package", sessions: 10, discount: 20, price: 6000 },
    ],
  },
];

// --------------------------------------------------------------------------
// Ambient / Pulse
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
// Difficulty meter — 4 bars, lime up to level
// --------------------------------------------------------------------------
function DifficultyMeter({ level, invert }: { level: Difficulty; invert?: boolean }) {
  const idx = DIFFICULTIES.indexOf(level);
  return (
    <View style={styles.diffRow}>
      <View style={styles.diffBars}>
        {DIFFICULTIES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.diffBar,
              { height: 6 + i * 3, backgroundColor: invert ? "rgba(255,255,255,0.14)" : C.hair },
              i <= idx && { backgroundColor: invert ? C.lime : C.ink },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.diffLbl, invert && { color: C.lime }]}>{level}</Text>
    </View>
  );
}

// --------------------------------------------------------------------------
// Header (sticky glass)
// --------------------------------------------------------------------------
function Header({ scrollY }: { scrollY: Animated.SharedValue<number> }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const glass = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [0, 1], Extrapolation.CLAMP),
  }));
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]} testID="services-header">
      <Animated.View style={[StyleSheet.absoluteFill, glass]}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.headerHair} />
      </Animated.View>
      <View style={styles.headerRow}>
        <Pressable style={styles.backBtn} onPress={() => router.back()} testID="back-btn">
          <Feather name="arrow-left" size={18} color={C.lime} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerKicker}>◇ TRAINER STUDIO</Text>
          <Text style={styles.headerTitle}>Services</Text>
        </View>
        <Pressable style={styles.headerIcon} testID="chart-btn">
          <Ionicons name="stats-chart" size={16} color={C.ink} />
        </Pressable>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Mode Tabs (Public / Manage / Create)
// --------------------------------------------------------------------------
const MODES = ["Public", "Manage", "Create"] as const;
type Mode = (typeof MODES)[number];

function ModeTabs({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const [w, setW] = useState(0);
  const seg = w / MODES.length;
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withSpring(MODES.indexOf(mode) * seg, { damping: 18, stiffness: 180 });
  }, [mode, seg, x]);
  const pill = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: seg,
  }));
  return (
    <View
      style={styles.tabsWrap}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      testID="mode-tabs"
    >
      <Animated.View style={[styles.tabPill, pill]}>
        <LinearGradient colors={[C.ink, "#242423"]} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {MODES.map((m) => {
        const active = m === mode;
        return (
          <Pressable
            key={m}
            onPress={() => {
              buzz();
              onChange(m);
            }}
            style={styles.tabItem}
            testID={`tab-${m.toLowerCase()}`}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{m}</Text>
            {active && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.tabDot} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// --------------------------------------------------------------------------
// PUBLIC — Service card (what students see)
// --------------------------------------------------------------------------
function PublicServiceCard({ s, index }: { s: PublicService; index: number }) {
  const featured = s.label === "FEATURED";
  const scale = useSharedValue(1);
  const pressed = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      entering={FadeInDown.duration(400).delay(80 * index)}
      onPressIn={() => (scale.value = withSpring(0.98))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={buzz}
      style={[styles.svc, featured ? styles.svcDark : styles.svcLight, pressed]}
      testID={`public-svc-${s.id}`}
    >
      {/* Corner ribbon (label) */}
      <View
        style={[
          styles.ribbon,
          {
            backgroundColor: featured ? C.lime : C.ink,
          },
        ]}
      >
        <View style={[styles.ribbonDot, { backgroundColor: featured ? C.ink : C.lime }]} />
        <Text style={[styles.ribbonText, { color: featured ? C.ink : C.lime }]}>
          {s.label}
        </Text>
      </View>

      {/* Index tag */}
      <View
        style={[
          styles.svcIdx,
          { backgroundColor: featured ? "rgba(255,255,255,0.08)" : C.bgSoft },
        ]}
      >
        <Text style={[styles.svcIdxText, { color: featured ? C.lime : C.mute }]}>
          {String(index + 1).padStart(2, "0")}
          <Text style={{ color: featured ? "rgba(255,255,255,0.5)" : C.mute }}>
            {" "}/ {String(PUBLIC_SERVICES.length).padStart(2, "0")}
          </Text>
        </Text>
      </View>

      {/* Price */}
      <View style={styles.svcPriceRow}>
        <Text style={[styles.svcCurr, { color: featured ? C.lime : C.limeDeep }]}>
          {s.currency}
        </Text>
        <Text style={[styles.svcPrice, { color: featured ? C.white : C.ink }]}>
          {" "}{s.price.toLocaleString()}
        </Text>
        <Text
          style={[
            styles.svcBilling,
            { color: featured ? "rgba(255,255,255,0.55)" : C.mute },
          ]}
        >
          {" "}/ {s.billing}
        </Text>
      </View>

      {/* Name */}
      <Text style={[styles.svcName, { color: featured ? C.white : C.ink }]}>
        {s.name}
      </Text>
      <Text
        style={[
          styles.svcDesc,
          { color: featured ? "rgba(255,255,255,0.7)" : C.mute },
        ]}
      >
        {s.description}
      </Text>

      {/* Info shapes row: duration, capacity, session type */}
      <View style={styles.infoRow}>
        <View style={[styles.infoTile, featured && styles.infoTileDark]}>
          <Ionicons
            name="time-outline"
            size={13}
            color={featured ? C.lime : C.ink}
          />
          <Text style={[styles.infoLbl, featured && { color: "rgba(255,255,255,0.55)" }]}>
            DURATION
          </Text>
          <Text style={[styles.infoVal, featured && { color: C.white }]}>
            {s.duration} min
          </Text>
        </View>

        <View style={[styles.infoTile, featured && styles.infoTileDark]}>
          <Ionicons
            name="people-outline"
            size={13}
            color={featured ? C.lime : C.ink}
          />
          <Text style={[styles.infoLbl, featured && { color: "rgba(255,255,255,0.55)" }]}>
            {s.capacity === "1-on-1" ? "FORMAT" : "GROUP"}
          </Text>
          <Text style={[styles.infoVal, featured && { color: C.white }]}>
            {s.capacity === "1-on-1" ? "1-on-1" : `Up to ${s.capacity}`}
          </Text>
        </View>

        <View style={[styles.infoTile, featured && styles.infoTileDark]}>
          <Ionicons
            name={
              s.sessionType === "Online"
                ? "laptop-outline"
                : s.sessionType === "In-person"
                ? "walk-outline"
                : "sync-outline"
            }
            size={13}
            color={featured ? C.lime : C.ink}
          />
          <Text style={[styles.infoLbl, featured && { color: "rgba(255,255,255,0.55)" }]}>
            MODE
          </Text>
          <Text style={[styles.infoVal, featured && { color: C.white }]}>
            {s.sessionType}
          </Text>
        </View>
      </View>

      {/* Difficulty meter */}
      <View style={styles.svcDiffWrap}>
        <Text
          style={[
            styles.aboutSubLbl,
            { color: featured ? "rgba(255,255,255,0.5)" : C.mute },
          ]}
        >
          DIFFICULTY
        </Text>
        <DifficultyMeter level={s.difficulty} invert={featured} />
      </View>

      {/* Outcomes chips */}
      <Text
        style={[
          styles.aboutSubLbl,
          { color: featured ? "rgba(255,255,255,0.5)" : C.mute, marginTop: 12 },
        ]}
      >
        OUTCOMES
      </Text>
      <View style={styles.chipRow}>
        {s.outcomes.slice(0, 3).map((o, i) => (
          <View
            key={o}
            style={[
              styles.outChip,
              featured && { backgroundColor: "rgba(218,254,76,0.12)", borderColor: C.lime },
            ]}
          >
            <View style={[styles.outChipDot, featured && { backgroundColor: C.lime }]} />
            <Text
              style={[
                styles.outChipText,
                { color: featured ? C.lime : C.ink },
              ]}
            >
              {o}
            </Text>
          </View>
        ))}
      </View>

      {/* Equipment icons */}
      <Text
        style={[
          styles.aboutSubLbl,
          { color: featured ? "rgba(255,255,255,0.5)" : C.mute, marginTop: 12 },
        ]}
      >
        BRING / EQUIPMENT
      </Text>
      <View style={styles.chipRow}>
        {s.equipment.map((e) => (
          <View
            key={e}
            style={[
              styles.eqPill,
              featured && { backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" },
            ]}
          >
            <MaterialCommunityIcons
              name={equipmentIcon(e)}
              size={12}
              color={featured ? C.lime : C.inkSoft}
            />
            <Text
              style={[
                styles.eqPillText,
                { color: featured ? "rgba(255,255,255,0.85)" : C.inkSoft },
              ]}
            >
              {e}
            </Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View
        style={[
          styles.svcFoot,
          { borderTopColor: featured ? "rgba(255,255,255,0.1)" : C.hair },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.svcFootLbl,
              { color: featured ? "rgba(255,255,255,0.55)" : C.mute },
            ]}
          >
            STARTING AT
          </Text>
          <Text
            style={[
              styles.svcFootVal,
              { color: featured ? C.lime : C.ink },
            ]}
          >
            {s.currency} {s.price.toLocaleString()}
          </Text>
        </View>
        <Pressable
          style={[
            styles.svcBookBtn,
            { backgroundColor: featured ? C.lime : C.ink },
          ]}
          onPress={buzz}
          testID={`book-${s.id}`}
        >
          <Text
            style={[
              styles.svcBookText,
              { color: featured ? C.ink : C.lime },
            ]}
          >
            Book
          </Text>
          <Feather
            name="arrow-up-right"
            size={14}
            color={featured ? C.ink : C.lime}
          />
        </Pressable>
      </View>
    </AnimatedPressable>
  );
}

function equipmentIcon(name: string): any {
  const key = name.toLowerCase();
  if (key.includes("kettle")) return "kettlebell";
  if (key.includes("dumb")) return "dumbbell";
  if (key.includes("mat")) return "meditation";
  if (key.includes("band")) return "sync-circle-outline" as any;
  if (key.includes("bar")) return "weight";
  return "check-circle-outline";
}

// --------------------------------------------------------------------------
// MANAGE — trainer-only service card + plans
// --------------------------------------------------------------------------
function StatusPill({ status }: { status: ManageService["status"] }) {
  const map = {
    ACTIVE: { bg: C.lime, ink: C.ink, dot: C.ink },
    PAUSED: { bg: C.amber, ink: C.ink, dot: C.ink },
    DRAFT: { bg: C.hair, ink: C.ink, dot: C.mute },
  } as const;
  const m = map[status];
  return (
    <View style={[styles.statusPill, { backgroundColor: m.bg }]}>
      <View style={[styles.statusDot, { backgroundColor: m.dot }]} />
      <Text style={[styles.statusText, { color: m.ink }]}>{status}</Text>
    </View>
  );
}

function ManagePlanCard({ p }: { p: ManagePlan }) {
  return (
    <View style={styles.planCard} testID={`plan-${p.id}`}>
      <View style={styles.planHead}>
        <View style={styles.planTypeChip}>
          <View style={styles.planTypeDot} />
          <Text style={styles.planTypeText}>{p.type.toUpperCase()}</Text>
        </View>
        {p.discount > 0 && (
          <View style={styles.planDiscount}>
            <Text style={styles.planDiscountText}>-{p.discount}%</Text>
          </View>
        )}
      </View>
      <Text style={styles.planName}>{p.name}</Text>
      <View style={styles.planRow}>
        <Text style={styles.planSess}>
          {p.sessions} <Text style={styles.planSessUnit}>sessions</Text>
        </Text>
      </View>
      <View style={styles.planPriceRow}>
        <Text style={styles.planPriceCurr}>₹</Text>
        <Text style={styles.planPrice}>{p.price.toLocaleString()}</Text>
      </View>
    </View>
  );
}

function ManageServiceCard({ s, index }: { s: ManageService; index: number }) {
  const [active, setActive] = useState(s.status === "ACTIVE");
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(80 * index)}
      style={styles.mCard}
      testID={`manage-svc-${s.id}`}
    >
      <View style={styles.mHead}>
        <View style={styles.mIdx}>
          <Text style={styles.mIdxText}>
            {String(index + 1).padStart(2, "0")}
          </Text>
        </View>
        <StatusPill status={active ? "ACTIVE" : "PAUSED"} />
        <View style={{ flex: 1 }} />
        <Switch
          value={active}
          onValueChange={(v) => {
            buzz();
            setActive(v);
          }}
          trackColor={{ true: C.ink, false: C.hair }}
          thumbColor={active ? C.lime : C.white}
          testID={`toggle-${s.id}`}
        />
      </View>

      <Text style={styles.mName}>{s.name}</Text>
      <Text style={styles.mDesc}>{s.description}</Text>

      <View style={styles.mMetaRow}>
        <View style={styles.mMeta}>
          <Ionicons name="time-outline" size={12} color={C.ink} />
          <Text style={styles.mMetaText}>{s.duration} min</Text>
        </View>
        <View style={styles.mMeta}>
          <Ionicons
            name={
              s.sessionType === "Online"
                ? "laptop-outline"
                : s.sessionType === "In-person"
                ? "walk-outline"
                : "sync-outline"
            }
            size={12}
            color={C.ink}
          />
          <Text style={styles.mMetaText}>{s.sessionType}</Text>
        </View>
      </View>

      {/* Plans header */}
      <View style={styles.plansHead}>
        <View>
          <Text style={styles.plansKicker}>◇ ACTIVE PLANS</Text>
          <Text style={styles.plansTitle}>
            {s.plans.length}{" "}
            <Text style={styles.plansTitleSub}>plans running</Text>
          </Text>
        </View>
        <Pressable style={styles.plansAddBtn} onPress={buzz} testID={`add-plan-${s.id}`}>
          <Feather name="plus" size={14} color={C.lime} />
          <Text style={styles.plansAddText}>Add</Text>
        </Pressable>
      </View>

      {/* Plans horizontal rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.plansRail}
      >
        {s.plans.map((p) => (
          <ManagePlanCard key={p.id} p={p} />
        ))}
      </ScrollView>

      {/* Actions row */}
      <View style={styles.mActions}>
        <Pressable style={styles.mActionGhost} onPress={buzz} testID={`preview-${s.id}`}>
          <Ionicons name="eye-outline" size={13} color={C.ink} />
          <Text style={styles.mActionGhostText}>Preview</Text>
        </Pressable>
        <Pressable style={styles.mActionGhost} onPress={buzz} testID={`duplicate-${s.id}`}>
          <Ionicons name="copy-outline" size={13} color={C.ink} />
          <Text style={styles.mActionGhostText}>Duplicate</Text>
        </Pressable>
        <Pressable style={styles.mActionMain} onPress={buzz} testID={`edit-${s.id}`}>
          <Feather name="edit-3" size={13} color={C.lime} />
          <Text style={styles.mActionMainText}>Edit</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// CREATE FORM — service builder
// --------------------------------------------------------------------------
function FieldWrap({
  label,
  children,
  optional,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
  hint?: string;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLblRow}>
        <Text style={styles.fieldLbl}>{label}</Text>
        {optional && <Text style={styles.fieldOpt}>optional</Text>}
      </View>
      {children}
      {hint && <Text style={styles.fieldHint}>{hint}</Text>}
    </View>
  );
}

function Chip({
  active,
  onPress,
  children,
  testID,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
  testID?: string;
}) {
  return (
    <Pressable
      onPress={() => {
        buzz();
        onPress();
      }}
      style={[styles.pickChip, active && styles.pickChipOn]}
      testID={testID}
    >
      <Text style={[styles.pickChipText, active && styles.pickChipTextOn]}>
        {children}
      </Text>
    </Pressable>
  );
}

function Stepper({
  value,
  onChange,
  min = 1,
  max = 30,
  testID,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  testID?: string;
}) {
  return (
    <View style={styles.stepper} testID={testID}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        style={styles.stepBtn}
        testID={`${testID}-dec`}
      >
        <Feather name="minus" size={14} color={C.lime} />
      </Pressable>
      <Text style={styles.stepVal}>{value}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        style={styles.stepBtn}
        testID={`${testID}-inc`}
      >
        <Feather name="plus" size={14} color={C.lime} />
      </Pressable>
    </View>
  );
}

function CreateForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [maxGroup, setMaxGroup] = useState(1);
  const [sessionType, setSessionType] = useState<SessionType>("Hybrid");
  const [currency, setCurrency] = useState<Currency>("INR");
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState<Difficulty>("Balanced");
  const [outcomes, setOutcomes] = useState<string[]>([]);
  const [outcomeInput, setOutcomeInput] = useState("");
  const [equipment, setEquipment] = useState<string[]>([]);
  const [equipInput, setEquipInput] = useState("");
  // pricing plan
  const [planDuration, setPlanDuration] = useState("30");
  const [planSessions, setPlanSessions] = useState(8);
  const [planPrice, setPlanPrice] = useState("");
  const [planDiscount, setPlanDiscount] = useState("0");

  const addOutcome = () => {
    const val = outcomeInput.trim();
    if (val && outcomes.length < 3) {
      buzz();
      setOutcomes((s) => [...s, val]);
      setOutcomeInput("");
    }
  };
  const addEquipment = () => {
    const val = equipInput.trim();
    if (val) {
      buzz();
      setEquipment((s) => [...s, val]);
      setEquipInput("");
    }
  };

  const priceNum = Number(planPrice) || 0;
  const discountNum = Number(planDiscount) || 0;
  const afterDiscount = priceNum ? Math.round(priceNum * (1 - discountNum / 100)) : 0;

  const canSave = !!name && !!description && priceNum > 0;

  return (
    <View style={styles.form} testID="create-form">
      {/* Progress hint */}
      <View style={styles.formHead}>
        <View style={styles.formKickerRow}>
          <View style={styles.limeDot} />
          <Text style={styles.formKicker}>◇ NEW SERVICE</Text>
        </View>
        <Text style={styles.formTitle}>Build a service</Text>
        <Text style={styles.formSub}>
          Details you set here appear on your public profile and in search.
        </Text>
      </View>

      {/* Name */}
      <FieldWrap label="Service name">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Private HIIT Coaching"
          placeholderTextColor={C.mute}
          style={styles.input}
          testID="input-name"
        />
      </FieldWrap>

      {/* Description */}
      <FieldWrap label="Description">
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="One-line pitch that shows on your card"
          placeholderTextColor={C.mute}
          multiline
          style={[styles.input, styles.inputMulti]}
          testID="input-description"
        />
      </FieldWrap>

      {/* Duration + max group in two cols */}
      <View style={styles.twoCol}>
        <View style={{ flex: 1 }}>
          <FieldWrap label="Duration">
            <View style={styles.durationRow}>
              {[30, 45, 60, 90].map((d) => (
                <Chip
                  key={d}
                  active={duration === d}
                  onPress={() => setDuration(d)}
                  testID={`dur-${d}`}
                >
                  {d} min
                </Chip>
              ))}
            </View>
          </FieldWrap>
        </View>
      </View>

      <FieldWrap label="Max group size">
        <View style={styles.stepRow}>
          <Stepper
            value={maxGroup}
            onChange={setMaxGroup}
            min={1}
            max={30}
            testID="max-group"
          />
          <Text style={styles.stepRowHint}>
            {maxGroup === 1 ? "This is a 1-on-1 service" : `Up to ${maxGroup} students`}
          </Text>
        </View>
      </FieldWrap>

      {/* Session type */}
      <FieldWrap label="Session type">
        <View style={styles.durationRow}>
          {SESSION_TYPES.map((s) => (
            <Chip
              key={s}
              active={sessionType === s}
              onPress={() => setSessionType(s)}
              testID={`stype-${s.toLowerCase()}`}
            >
              {s}
            </Chip>
          ))}
        </View>
      </FieldWrap>

      {/* Difficulty */}
      <FieldWrap label="Difficulty">
        <View style={styles.durationRow}>
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              active={difficulty === d}
              onPress={() => setDifficulty(d)}
              testID={`diff-${d.toLowerCase()}`}
            >
              {d}
            </Chip>
          ))}
        </View>
      </FieldWrap>

      {/* Outcomes */}
      <FieldWrap label="Outcomes" optional hint="Up to 3 · shown as chips on your card">
        <View style={styles.tagInputRow}>
          <TextInput
            value={outcomeInput}
            onChangeText={setOutcomeInput}
            onSubmitEditing={addOutcome}
            placeholder="e.g. Fat loss"
            placeholderTextColor={C.mute}
            style={[styles.input, { flex: 1 }]}
            testID="input-outcome"
          />
          <Pressable style={styles.tagAdd} onPress={addOutcome} testID="add-outcome">
            <Feather name="plus" size={14} color={C.lime} />
          </Pressable>
        </View>
        {outcomes.length > 0 && (
          <View style={[styles.chipRow, { marginTop: 8 }]}>
            {outcomes.map((o, i) => (
              <Pressable
                key={o + i}
                onPress={() =>
                  setOutcomes((s) => s.filter((v) => v !== o))
                }
                style={[styles.outChip, styles.outChipRemovable]}
                testID={`outcome-chip-${i}`}
              >
                <View style={styles.outChipDot} />
                <Text style={styles.outChipText}>{o}</Text>
                <Ionicons name="close" size={12} color={C.ink} />
              </Pressable>
            ))}
          </View>
        )}
      </FieldWrap>

      {/* Equipment */}
      <FieldWrap label="Equipment" optional>
        <View style={styles.tagInputRow}>
          <TextInput
            value={equipInput}
            onChangeText={setEquipInput}
            onSubmitEditing={addEquipment}
            placeholder="e.g. Kettlebell"
            placeholderTextColor={C.mute}
            style={[styles.input, { flex: 1 }]}
            testID="input-equipment"
          />
          <Pressable style={styles.tagAdd} onPress={addEquipment} testID="add-equipment">
            <Feather name="plus" size={14} color={C.lime} />
          </Pressable>
        </View>
        {equipment.length > 0 && (
          <View style={[styles.chipRow, { marginTop: 8 }]}>
            {equipment.map((e, i) => (
              <Pressable
                key={e + i}
                onPress={() =>
                  setEquipment((s) => s.filter((v) => v !== e))
                }
                style={styles.eqPillRemovable}
                testID={`equip-chip-${i}`}
              >
                <MaterialCommunityIcons name={equipmentIcon(e)} size={12} color={C.inkSoft} />
                <Text style={styles.eqPillText}>{e}</Text>
                <Ionicons name="close" size={11} color={C.ink} />
              </Pressable>
            ))}
          </View>
        )}
      </FieldWrap>

      {/* PRICING PLAN block */}
      <View style={styles.priceBlock}>
        <View style={styles.priceHead}>
          <View style={styles.formKickerRow}>
            <View style={styles.limeDot} />
            <Text style={styles.formKicker}>◇ PRICING PLAN</Text>
          </View>
          <Text style={styles.priceTitle}>Pricing plan</Text>
        </View>

        {/* Currency selector */}
        <FieldWrap label="Currency">
          <View style={styles.durationRow}>
            {CURRENCIES.map((c) => (
              <Chip
                key={c}
                active={currency === c}
                onPress={() => setCurrency(c)}
                testID={`ccy-${c}`}
              >
                {c}
              </Chip>
            ))}
          </View>
        </FieldWrap>

        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <FieldWrap label="Plan duration">
              <TextInput
                value={planDuration}
                onChangeText={setPlanDuration}
                placeholder="30"
                keyboardType="numeric"
                placeholderTextColor={C.mute}
                style={styles.input}
                testID="input-plan-duration"
              />
              <Text style={styles.fieldHint}>in days</Text>
            </FieldWrap>
          </View>
          <View style={{ flex: 1 }}>
            <FieldWrap label="Sessions">
              <View style={styles.stepRow}>
                <Stepper
                  value={planSessions}
                  onChange={setPlanSessions}
                  min={1}
                  max={100}
                  testID="plan-sessions"
                />
              </View>
            </FieldWrap>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <FieldWrap label="Price">
              <View style={styles.priceInputRow}>
                <View style={styles.priceCurr}>
                  <Text style={styles.priceCurrText}>{currency}</Text>
                </View>
                <TextInput
                  value={planPrice}
                  onChangeText={setPlanPrice}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={C.mute}
                  style={[styles.input, styles.priceInput]}
                  testID="input-price"
                />
              </View>
            </FieldWrap>
          </View>
          <View style={{ flex: 1 }}>
            <FieldWrap label="Discount %">
              <TextInput
                value={planDiscount}
                onChangeText={setPlanDiscount}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={C.mute}
                style={styles.input}
                testID="input-discount"
              />
            </FieldWrap>
          </View>
        </View>

        {/* Live preview */}
        {priceNum > 0 && (
          <View style={styles.pricePreview}>
            <Text style={styles.pricePreviewLbl}>◇ FINAL PRICE</Text>
            <View style={styles.pricePreviewRow}>
              {discountNum > 0 && (
                <Text style={styles.pricePreviewStrike}>
                  {currency} {priceNum.toLocaleString()}
                </Text>
              )}
              <Text style={styles.pricePreviewFinal}>
                {currency} {afterDiscount.toLocaleString()}
              </Text>
              {discountNum > 0 && (
                <View style={styles.pricePreviewSave}>
                  <Text style={styles.pricePreviewSaveText}>
                    save {discountNum}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {/* Save actions */}
      <View style={styles.saveRow}>
        <Pressable style={styles.saveDraft} onPress={buzz} testID="save-draft">
          <Text style={styles.saveDraftText}>Save draft</Text>
        </Pressable>
        <Pressable
          onPress={buzz}
          disabled={!canSave}
          style={[styles.savePub, !canSave && { opacity: 0.5 }]}
          testID="publish-service"
        >
          <Text style={styles.savePubText}>Publish service</Text>
          <View style={styles.savePubArrow}>
            <Feather name="arrow-up-right" size={16} color={C.ink} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Screen
// --------------------------------------------------------------------------
export default function TrainerServices() {
  const [mode, setMode] = useState<Mode>("Public");
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
        keyboardShouldPersistTaps="handled"
        testID="services-scroll"
      >
        <View style={{ height: 96 }} />

        {/* Hero intro card */}
        <View style={styles.pageBlock}>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.introCard}>
            <Text style={styles.bigNum} pointerEvents="none">
              {mode === "Public" ? "01" : mode === "Manage" ? "02" : "03"}
            </Text>
            <View style={styles.introKickerRow}>
              <View style={styles.limeDotSm} />
              <Text style={styles.introKicker}>◇ SERVICES</Text>
            </View>
            <Text style={styles.introTitle}>
              {mode === "Public" && "Your public card"}
              {mode === "Manage" && "Manage & pricing"}
              {mode === "Create" && "Build a new one"}
            </Text>
            <Text style={styles.introSub}>
              {mode === "Public" &&
                "This is exactly what students see when they land on your profile."}
              {mode === "Manage" &&
                "Toggle status, edit copy, and tune the plans running under each service."}
              {mode === "Create" &&
                "One clean form. Publish live or save as a draft — everything stays editable."}
            </Text>
            {mode !== "Create" && (
              <View style={styles.introStats}>
                <View style={styles.iStat}>
                  <Text style={styles.iStatNum}>{PUBLIC_SERVICES.length}</Text>
                  <Text style={styles.iStatLbl}>services</Text>
                </View>
                <View style={styles.iStatDiv} />
                <View style={styles.iStat}>
                  <Text style={styles.iStatNum}>
                    {MANAGE_SERVICES.reduce((n, s) => n + s.plans.length, 0)}
                  </Text>
                  <Text style={styles.iStatLbl}>active plans</Text>
                </View>
                <View style={styles.iStatDiv} />
                <View style={styles.iStat}>
                  <Text style={[styles.iStatNum, { color: C.lime }]}>◉ 4</Text>
                  <Text style={styles.iStatLbl}>booked today</Text>
                </View>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Mode tabs */}
        <View style={styles.pageBlock}>
          <ModeTabs mode={mode} onChange={setMode} />
        </View>

        {/* Section content */}
        {mode === "Public" && (
          <View style={[styles.pageBlock, { gap: 16, marginTop: 20 }]}>
            {PUBLIC_SERVICES.map((s, i) => (
              <PublicServiceCard key={s.id} s={s} index={i} />
            ))}
          </View>
        )}

        {mode === "Manage" && (
          <View style={[styles.pageBlock, { gap: 16, marginTop: 20 }]}>
            {MANAGE_SERVICES.map((s, i) => (
              <ManageServiceCard key={s.id} s={s} index={i} />
            ))}
            <Pressable style={styles.newBtn} onPress={() => setMode("Create")} testID="new-service-btn">
              <View style={styles.newBtnIcon}>
                <Feather name="plus" size={16} color={C.lime} />
              </View>
              <Text style={styles.newBtnText}>Create a new service</Text>
              <Feather name="arrow-right" size={14} color={C.ink} />
            </Pressable>
          </View>
        )}

        {mode === "Create" && (
          <View style={[styles.pageBlock, { marginTop: 20 }]}>
            <CreateForm />
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>◇ habit101 · trainer studio ◇</Text>
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
  headerKicker: {
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

  // Intro card
  introCard: {
    borderRadius: 26,
    backgroundColor: C.ink,
    padding: 22,
    overflow: "hidden",
  },
  bigNum: {
    position: "absolute",
    right: -14,
    top: -60,
    fontSize: 240,
    fontWeight: "900",
    color: C.lime,
    opacity: 0.11,
    letterSpacing: -10,
  },
  introKickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  introKicker: {
    color: C.lime,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "900",
  },
  limeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lime },
  limeDotSm: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.lime },
  introTitle: {
    color: C.white,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 8,
  },
  introSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 8,
  },
  introStats: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    alignItems: "center",
  },
  iStat: { flex: 1, alignItems: "center" },
  iStatDiv: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  iStatNum: {
    color: C.white,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  iStatLbl: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: "800",
    marginTop: 2,
  },

  // Tabs
  tabsWrap: {
    marginTop: 18,
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

  // Public service card
  svc: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  svcDark: { backgroundColor: C.ink, borderColor: C.ink },
  svcLight: { backgroundColor: C.white, borderColor: C.hair },
  ribbon: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  ribbonDot: { width: 5, height: 5, borderRadius: 2.5 },
  ribbonText: { fontSize: 9, letterSpacing: 1, fontWeight: "900" },
  svcIdx: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 14,
  },
  svcIdxText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  svcPriceRow: { flexDirection: "row", alignItems: "flex-end" },
  svcCurr: {
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: "900",
    marginBottom: 6,
  },
  svcPrice: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  svcBilling: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 3,
  },
  svcName: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginTop: 8,
  },
  svcDesc: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 6,
  },

  infoRow: { marginTop: 14, flexDirection: "row", gap: 6 },
  infoTile: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    backgroundColor: C.bgSoft,
  },
  infoTileDark: { backgroundColor: "rgba(255,255,255,0.05)" },
  infoLbl: {
    fontSize: 8,
    letterSpacing: 1.4,
    fontWeight: "900",
    color: C.mute,
    marginTop: 4,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
    marginTop: 2,
  },

  aboutSubLbl: {
    color: C.mute,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "900",
    marginBottom: 8,
  },
  svcDiffWrap: { marginTop: 16 },
  diffRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  diffBars: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  diffBar: {
    width: 8,
    borderRadius: 2,
  },
  diffLbl: {
    fontSize: 12,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.2,
  },

  chipRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  outChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.lime,
    borderWidth: 1,
    borderColor: C.lime,
  },
  outChipRemovable: {
    backgroundColor: C.lime,
    borderColor: C.ink,
  },
  outChipDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.ink },
  outChipText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.1,
  },

  eqPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: C.bgSoft,
    borderWidth: 1,
    borderColor: C.hair,
  },
  eqPillRemovable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: C.bgSoft,
    borderWidth: 1,
    borderColor: C.ink,
  },
  eqPillText: {
    fontSize: 11,
    fontWeight: "800",
    color: C.inkSoft,
    letterSpacing: -0.1,
  },

  svcFoot: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  svcFootLbl: {
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  svcFootVal: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: 2,
  },
  svcBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 21,
  },
  svcBookText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  // Manage
  mCard: {
    borderRadius: 24,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    padding: 18,
  },
  mHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mIdx: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  mIdxText: {
    color: C.lime,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, letterSpacing: 1.4, fontWeight: "900" },
  mName: {
    fontSize: 20,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.6,
    marginTop: 12,
  },
  mDesc: { fontSize: 12, color: C.mute, fontWeight: "700", marginTop: 4 },
  mMetaRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  mMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: C.bgSoft,
  },
  mMetaText: {
    fontSize: 11,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.1,
  },
  plansHead: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  plansKicker: {
    color: C.limeDeep,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  plansTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
    marginTop: 3,
  },
  plansTitleSub: { color: C.mute, fontSize: 11, fontWeight: "700" },
  plansAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: C.ink,
  },
  plansAddText: {
    color: C.lime,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  plansRail: { gap: 10, paddingRight: 4 },
  planCard: {
    width: 160,
    padding: 12,
    borderRadius: 16,
    backgroundColor: C.ink,
    borderWidth: 1,
    borderColor: C.ink,
  },
  planHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  planTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  planTypeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.lime },
  planTypeText: {
    color: C.lime,
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: "900",
  },
  planDiscount: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: C.lime,
  },
  planDiscountText: {
    color: C.ink,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  planName: {
    color: C.white,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: -0.3,
    marginTop: 8,
  },
  planRow: { marginTop: 4 },
  planSess: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "800",
  },
  planSessUnit: { fontSize: 10, fontWeight: "700" },
  planPriceRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPriceCurr: { color: C.lime, fontSize: 10, fontWeight: "900" },
  planPrice: {
    color: C.white,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginLeft: 3,
  },
  mActions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 8,
  },
  mActionGhost: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.bgSoft,
    borderWidth: 1,
    borderColor: C.hair,
  },
  mActionGhostText: { fontSize: 11, fontWeight: "900", color: C.ink },
  mActionMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.ink,
  },
  mActionMainText: {
    color: C.lime,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  newBtn: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.ink,
    borderStyle: "dashed",
  },
  newBtnIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  newBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
  },

  // Create form
  form: {
    borderRadius: 26,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    padding: 18,
    gap: 16,
  },
  formHead: { marginBottom: 2 },
  formKickerRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  formKicker: {
    color: C.limeDeep,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "900",
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.8,
    marginTop: 4,
  },
  formSub: {
    color: C.mute,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  field: { gap: 6 },
  fieldLblRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLbl: {
    color: C.ink,
    fontSize: 11,
    letterSpacing: 0.5,
    fontWeight: "900",
  },
  fieldOpt: {
    color: C.mute,
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "900",
  },
  fieldHint: {
    color: C.mute,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  input: {
    borderRadius: 14,
    backgroundColor: C.bgSoft,
    borderWidth: 1,
    borderColor: C.hair,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -0.2,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  inputMulti: { minHeight: 76, textAlignVertical: "top" },

  durationRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  pickChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: C.bgSoft,
    borderWidth: 1,
    borderColor: C.hair,
  },
  pickChipOn: { backgroundColor: C.ink, borderColor: C.ink },
  pickChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: C.inkSoft,
    letterSpacing: -0.1,
  },
  pickChipTextOn: { color: C.lime },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepRowHint: { color: C.mute, fontSize: 11, fontWeight: "700" },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 4,
    borderRadius: 14,
    backgroundColor: C.ink,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: C.inkSoft,
    borderWidth: 1,
    borderColor: C.lime,
    justifyContent: "center",
    alignItems: "center",
  },
  stepVal: {
    color: C.lime,
    fontSize: 16,
    fontWeight: "900",
    minWidth: 30,
    textAlign: "center",
  },

  twoCol: { flexDirection: "row", gap: 12 },

  tagInputRow: { flexDirection: "row", gap: 6, alignItems: "center" },
  tagAdd: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },

  priceBlock: {
    marginTop: 4,
    padding: 14,
    borderRadius: 20,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.hair,
    borderStyle: "dashed",
    gap: 14,
  },
  priceHead: {},
  priceTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.5,
    marginTop: 4,
  },
  priceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceCurr: {
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  priceCurrText: { color: C.lime, fontSize: 12, fontWeight: "900", letterSpacing: 0.5 },
  priceInput: { flex: 1 },

  pricePreview: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: C.ink,
  },
  pricePreviewLbl: {
    color: C.lime,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: "900",
  },
  pricePreviewRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  pricePreviewStrike: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    fontWeight: "800",
    textDecorationLine: "line-through",
  },
  pricePreviewFinal: {
    color: C.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  pricePreviewSave: {
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: C.lime,
  },
  pricePreviewSaveText: {
    color: C.ink,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  saveRow: {
    marginTop: 8,
    flexDirection: "row",
    gap: 10,
  },
  saveDraft: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: C.bgSoft,
    borderWidth: 1,
    borderColor: C.hair,
  },
  saveDraftText: { color: C.ink, fontSize: 13, fontWeight: "900" },
  savePub: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 18,
    paddingRight: 6,
    borderRadius: 20,
    backgroundColor: C.lime,
    justifyContent: "space-between",
  },
  savePubText: {
    color: C.ink,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  savePubArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
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
