import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
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
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

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

// --------------------------------------------------------------------------
// Animated brand ticker (marquee-style)
// --------------------------------------------------------------------------
function Ticker() {
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withRepeat(
      withTiming(-SCREEN_W, { duration: 18000, easing: Easing.linear }),
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
            ◇ MOVE DAILY  ◇ TRAIN SMART  ◇ MOVE DAILY  ◇ TRAIN SMART  {"  "}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

// --------------------------------------------------------------------------
// Mode toggle (Sign In / Join)
// --------------------------------------------------------------------------
function ModeToggle({
  mode,
  onChange,
}: {
  mode: "signin" | "signup";
  onChange: (m: "signin" | "signup") => void;
}) {
  const [w, setW] = useState(0);
  const seg = w / 2;
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withSpring(mode === "signin" ? 0 : seg, {
      damping: 18,
      stiffness: 180,
    });
  }, [mode, seg, x]);
  const pill = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: seg,
  }));
  return (
    <View
      style={styles.toggleWrap}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      testID="mode-toggle"
    >
      <Animated.View style={[styles.togglePill, pill]}>
        <LinearGradient
          colors={[C.ink, "#242423"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {(["signin", "signup"] as const).map((m) => {
        const active = mode === m;
        return (
          <Pressable
            key={m}
            onPress={() => {
              buzz();
              onChange(m);
            }}
            style={styles.toggleItem}
            testID={`toggle-${m}`}
          >
            <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
              {m === "signin" ? "Sign in" : "Join"}
            </Text>
            {active && (
              <Animated.View
                entering={FadeIn.duration(200)}
                style={styles.toggleDot}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

// --------------------------------------------------------------------------
// Animated input field
// --------------------------------------------------------------------------
function Field({
  label,
  value,
  onChange,
  icon,
  secure,
  testID,
  autoCapitalize = "none",
  keyboardType = "default",
  onSubmitEditing,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
  testID: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric";
  onSubmitEditing?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const [hide, setHide] = useState(!!secure);
  const active = focused || value.length > 0;
  const f = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    f.value = withTiming(active ? 1 : 0, { duration: 220 });
  }, [active, f]);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(f.value, [0, 1], [0, -22]) },
      { scale: interpolate(f.value, [0, 1], [1, 0.82]) },
    ],
  }));
  const barStyle = useAnimatedStyle(() => ({
    width: `${interpolate(f.value, [0, 1], [0, 100])}%`,
    opacity: focused ? 1 : 0.6,
  }));
  const wrapStyle = useAnimatedStyle(() => ({
    borderColor: focused ? C.ink : (C.hair as any),
    backgroundColor: focused ? C.white : (C.glassStrong as any),
  }));

  return (
    <Animated.View style={[styles.field, wrapStyle]}>
      <View style={styles.fieldIcon}>
        <Ionicons name={icon} size={18} color={focused ? C.ink : C.mute} />
      </View>

      <View style={styles.fieldInner}>
        <Animated.Text
          style={[
            styles.fieldLabel,
            labelStyle,
            focused && { color: C.limeDeep },
          ]}
          pointerEvents="none"
        >
          {label}
        </Animated.Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          secureTextEntry={hide}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          style={styles.fieldInput}
          testID={testID}
          placeholderTextColor={C.mute}
        />

        {/* Animated bottom bar */}
        <View style={styles.fieldBarTrack}>
          <Animated.View style={[styles.fieldBar, barStyle]} />
        </View>
      </View>

      {secure && (
        <Pressable
          onPress={() => setHide((v) => !v)}
          style={styles.fieldEye}
          testID={`${testID}-eye`}
        >
          <Ionicons
            name={hide ? "eye-off-outline" : "eye-outline"}
            size={18}
            color={C.mute}
          />
        </Pressable>
      )}
    </Animated.View>
  );
}

// --------------------------------------------------------------------------
// Password strength meter
// --------------------------------------------------------------------------
function scoreOf(pw: string) {
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const STR_LABELS = ["too short", "weak", "okay", "strong", "iron-clad"];

function StrengthMeter({ password }: { password: string }) {
  const s = scoreOf(password);
  return (
    <View style={styles.strength} testID="strength-meter">
      <View style={styles.strengthBars}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              {
                backgroundColor:
                  i < s
                    ? s <= 1
                      ? C.danger
                      : s === 2
                      ? "#FFB84D"
                      : C.limeDeep
                    : C.hair,
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.strengthLbl}>
        {password.length ? STR_LABELS[s] : "add a password"}
      </Text>
    </View>
  );
}

// --------------------------------------------------------------------------
// Big morphing submit button
// --------------------------------------------------------------------------
function SubmitButton({
  label,
  onPress,
  loading,
  disabled,
  testID,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
  testID: string;
}) {
  const scale = useSharedValue(1);
  const shine = useSharedValue(0);
  useEffect(() => {
    shine.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.linear }),
      -1,
      false
    );
  }, [shine]);
  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shine.value, [0, 1], [-160, SCREEN_W]) }],
    opacity: interpolate(shine.value, [0, 0.5, 1], [0, 0.6, 0]),
  }));
  const pressed = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.55 : 1,
  }));
  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.97))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={() => !disabled && onPress()}
      disabled={disabled}
      style={[styles.submit, pressed]}
      testID={testID}
    >
      <View style={styles.submitInner}>
        {!loading ? (
          <>
            <Text style={styles.submitText}>{label}</Text>
            <View style={styles.submitArrow}>
              <Feather name="arrow-up-right" size={20} color={C.lime} />
            </View>
          </>
        ) : (
          <View style={styles.submitLoad}>
            <LoadingDots />
            <Text style={styles.submitLoadText}>hang tight…</Text>
          </View>
        )}
      </View>
      {/* Shine sweep */}
      <Animated.View style={[styles.submitShine, shineStyle]}>
        <LinearGradient
          colors={["transparent", "rgba(10,10,10,0.35)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </AnimatedPressable>
  );
}

function LoadingDots() {
  const a = useSharedValue(0);
  useEffect(() => {
    a.value = withRepeat(withTiming(1, { duration: 900 }), -1, false);
  }, [a]);
  const d0 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate((a.value + 0) % 1, [0, 0.5, 1], [0, -6, 0]) }],
    opacity: interpolate((a.value + 0) % 1, [0, 0.5, 1], [0.4, 1, 0.4]),
  }));
  const d1 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate((a.value + 0.33) % 1, [0, 0.5, 1], [0, -6, 0]) }],
    opacity: interpolate((a.value + 0.33) % 1, [0, 0.5, 1], [0.4, 1, 0.4]),
  }));
  const d2 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate((a.value + 0.66) % 1, [0, 0.5, 1], [0, -6, 0]) }],
    opacity: interpolate((a.value + 0.66) % 1, [0, 0.5, 1], [0.4, 1, 0.4]),
  }));
  return (
    <View style={{ flexDirection: "row", gap: 5 }}>
      <Animated.View style={[styles.loadDot, d0]} />
      <Animated.View style={[styles.loadDot, d1]} />
      <Animated.View style={[styles.loadDot, d2]} />
    </View>
  );
}

// --------------------------------------------------------------------------
// Confetti burst (mini dots)
// --------------------------------------------------------------------------
function ConfettiPiece({
  angle,
  color,
  p,
}: {
  angle: number;
  color: string;
  p: Animated.SharedValue<number>;
}) {
  const rad = (angle * Math.PI) / 180;
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.6, 1], [1, 1, 0]),
    transform: [
      { translateX: interpolate(p.value, [0, 1], [0, Math.sin(rad) * 140]) },
      { translateY: interpolate(p.value, [0, 1], [0, Math.cos(rad) * -160]) },
      { scale: interpolate(p.value, [0, 1], [0.6, 1.2]) },
    ],
  }));
  return <Animated.View style={[styles.confetti, { backgroundColor: color }, style]} />;
}

function Confetti({ show }: { show: boolean }) {
  const p = useSharedValue(0);
  useEffect(() => {
    if (show) {
      p.value = 0;
      p.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.exp) });
    }
  }, [show, p]);
  const items = [
    { angle: -70, color: C.lime },
    { angle: -40, color: "#FFC9A8" },
    { angle: -10, color: "#BFE8FF" },
    { angle: 20, color: "#F4B0FF" },
    { angle: 50, color: C.lime },
    { angle: 80, color: "#FFE9A8" },
  ];
  if (!show) return null;
  return (
    <View pointerEvents="none" style={styles.confettiWrap}>
      {items.map((it, i) => (
        <ConfettiPiece key={i} angle={it.angle} color={it.color} p={p} />
      ))}
    </View>
  );
}

// --------------------------------------------------------------------------
// Social button
// --------------------------------------------------------------------------
function SocialBtn({
  label,
  icon,
  onPress,
  variant,
  testID,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  variant: "dark" | "light";
  testID: string;
}) {
  const scale = useSharedValue(1);
  const pressed = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.96))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={() => {
        buzz();
        onPress();
      }}
      style={[
        styles.social,
        variant === "dark" ? styles.socialDark : styles.socialLight,
        pressed,
      ]}
      testID={testID}
    >
      {icon}
      <Text
        style={[
          styles.socialText,
          { color: variant === "dark" ? C.lime : C.ink },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// --------------------------------------------------------------------------
// Screen
// --------------------------------------------------------------------------
export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isSignup = mode === "signup";
  const emailOk = /\S+@\S+\.\S+/.test(email);
  const pwOk = password.length >= 6;
  const nameOk = !isSignup || name.trim().length >= 2;
  const canSubmit = emailOk && pwOk && nameOk && (!isSignup || agree);

  const handleSubmit = () => {
    if (!canSubmit) return;
    buzz("medium");
    setLoading(true);
    // UI-only: simulate then confetti + navigate
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.replace("/");
      }, 900);
    }, 900);
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <AmbientBackdrop />

      {/* Giant brutalist backdrop word */}
      <Text style={styles.bigWord} pointerEvents="none">
        {isSignup ? "JOIN" : "HEY"}
      </Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 18, paddingBottom: 40 },
          ]}
          testID="auth-scroll"
        >
          {/* Top bar with brand + skip */}
          <View style={styles.topBar}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>P</Text>
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.brandKicker}>◇ PULSE</Text>
                <Text style={styles.brandName}>Move Club</Text>
              </View>
            </View>
            <Pressable
              style={styles.skipBtn}
              onPress={() => {
                buzz();
                router.replace("/");
              }}
              testID="skip-btn"
            >
              <Text style={styles.skipText}>Skip</Text>
              <Feather name="arrow-right" size={13} color={C.ink} />
            </Pressable>
          </View>

          <Ticker />

          {/* Hero title */}
          <Animated.View
            key={mode}
            entering={FadeInDown.duration(360)}
            style={styles.hero}
          >
            <Text style={styles.heroKicker}>
              {isSignup ? "◇ NEW HERE" : "◇ WELCOME BACK"}
            </Text>
            <Text style={styles.heroTitle}>
              {isSignup ? "Let's move" : "Log back in"}
              {"\n"}
              <Text style={styles.heroTitleLime}>
                {isSignup ? "together." : "and go."}
              </Text>
            </Text>
            <Text style={styles.heroSub}>
              {isSignup
                ? "Set your handle, pick your crew, hit day one."
                : "Pick up your streak right where you left it."}
            </Text>
          </Animated.View>

          {/* Mode toggle */}
          <ModeToggle mode={mode} onChange={setMode} />

          {/* Form card */}
          <View style={styles.card} testID="auth-card">
            {isSignup && (
              <Animated.View entering={FadeInDown.duration(320)}>
                <Field
                  label="Full name"
                  value={name}
                  onChange={setName}
                  icon="person-outline"
                  testID="name-input"
                  autoCapitalize="words"
                />
              </Animated.View>
            )}

            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              icon="mail-outline"
              testID="email-input"
              keyboardType="email-address"
            />

            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              icon="lock-closed-outline"
              secure
              testID="password-input"
              onSubmitEditing={handleSubmit}
            />

            {isSignup && <StrengthMeter password={password} />}

            {!isSignup ? (
              <View style={styles.rowBetween}>
                <Pressable
                  style={styles.rememberRow}
                  onPress={() => {
                    buzz();
                    setAgree((v) => !v);
                  }}
                  testID="remember-me"
                >
                  <View style={[styles.checkbox, agree && styles.checkboxOn]}>
                    {agree && <Ionicons name="checkmark" size={12} color={C.ink} />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </Pressable>
                <Pressable onPress={buzz} testID="forgot-pw">
                  <Text style={styles.forgotText}>Forgot?</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.termsRow}
                onPress={() => {
                  buzz();
                  setAgree((v) => !v);
                }}
                testID="agree-terms"
              >
                <View style={[styles.checkbox, agree && styles.checkboxOn]}>
                  {agree && <Ionicons name="checkmark" size={12} color={C.ink} />}
                </View>
                <Text style={styles.termsText}>
                  I agree to <Text style={styles.termsLink}>Terms</Text> &{" "}
                  <Text style={styles.termsLink}>Privacy</Text>
                </Text>
              </Pressable>
            )}

            <View style={{ marginTop: 8 }}>
              <SubmitButton
                label={isSignup ? "Create account" : "Sign in"}
                onPress={handleSubmit}
                loading={loading}
                disabled={!canSubmit}
                testID="submit-btn"
              />
              <Confetti show={success} />
            </View>

            {/* OR divider */}
            <View style={styles.divider}>
              <View style={styles.divLine} />
              <View style={styles.divBadge}>
                <Text style={styles.divBadgeText}>◇ OR ◇</Text>
              </View>
              <View style={styles.divLine} />
            </View>

            {/* Social row */}
            <View style={styles.socialRow}>
              <SocialBtn
                label="Google"
                icon={
                  <View style={styles.googleG}>
                    <Text style={styles.googleGText}>G</Text>
                  </View>
                }
                onPress={() => {}}
                variant="light"
                testID="social-google"
              />
              <SocialBtn
                label="Apple"
                icon={<Ionicons name="logo-apple" size={18} color={C.lime} />}
                onPress={() => {}}
                variant="dark"
                testID="social-apple"
              />
            </View>
          </View>

          {/* Bottom link */}
          <Pressable
            onPress={() => {
              buzz();
              setMode(isSignup ? "signin" : "signup");
            }}
            style={styles.switchRow}
            testID="switch-mode"
          >
            <Text style={styles.switchText}>
              {isSignup ? "Already in the club?" : "First time here?"}{" "}
              <Text style={styles.switchLink}>
                {isSignup ? "Sign in" : "Create an account"}
              </Text>
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>◇ your moves. your rules. ◇</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20 },

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

  bigWord: {
    position: "absolute",
    top: 40,
    left: -18,
    fontSize: 260,
    fontWeight: "900",
    color: C.lime,
    opacity: 0.14,
    letterSpacing: -10,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center" },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  brandMarkText: {
    fontSize: 20,
    fontWeight: "900",
    color: C.lime,
    letterSpacing: -1,
  },
  brandKicker: {
    fontSize: 10,
    color: C.limeDeep,
    letterSpacing: 2,
    fontWeight: "900",
  },
  brandName: {
    fontSize: 15,
    fontWeight: "900",
    color: C.ink,
    letterSpacing: -0.3,
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

  // Ticker
  ticker: {
    marginTop: 18,
    height: 26,
    borderRadius: 13,
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

  // Hero
  hero: { marginTop: 22 },
  heroKicker: {
    fontSize: 11,
    color: C.limeDeep,
    letterSpacing: 2,
    fontWeight: "900",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 40,
    lineHeight: 42,
    color: C.ink,
    fontWeight: "900",
    letterSpacing: -1.6,
  },
  heroTitleLime: {
    color: C.ink,
    backgroundColor: "transparent",
  },
  heroSub: {
    marginTop: 10,
    fontSize: 13,
    color: C.mute,
    fontWeight: "600",
    lineHeight: 19,
  },

  // Toggle
  toggleWrap: {
    marginTop: 22,
    height: 56,
    borderRadius: 20,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.hair,
    padding: 6,
    flexDirection: "row",
    position: "relative",
  },
  togglePill: {
    position: "absolute",
    top: 6,
    left: 6,
    bottom: 6,
    borderRadius: 14,
    overflow: "hidden",
  },
  toggleItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    zIndex: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.mute,
    letterSpacing: -0.2,
  },
  toggleTextActive: { color: C.lime },
  toggleDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.lime },

  // Card
  card: {
    marginTop: 18,
    borderRadius: 26,
    padding: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.hair,
    shadowColor: C.ink,
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    gap: 14,
  },

  // Field
  field: {
    height: 66,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.hair,
    backgroundColor: C.glassStrong,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  fieldIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  fieldInner: { flex: 1, marginLeft: 10, justifyContent: "center", height: "100%" },
  fieldLabel: {
    position: "absolute",
    top: 22,
    left: 2,
    fontSize: 14,
    color: C.mute,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: C.ink,
    letterSpacing: -0.2,
    paddingTop: 16,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  fieldBarTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: C.hair,
    overflow: "hidden",
  },
  fieldBar: {
    height: "100%",
    backgroundColor: C.lime,
    borderRadius: 1,
  },
  fieldEye: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },

  // Strength
  strength: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: -4,
    marginBottom: -2,
  },
  strengthBars: { flex: 1, flexDirection: "row", gap: 4, height: 6 },
  strengthBar: {
    flex: 1,
    borderRadius: 3,
  },
  strengthLbl: {
    fontSize: 10,
    letterSpacing: 1.3,
    fontWeight: "900",
    color: C.mute,
    minWidth: 88,
    textAlign: "right",
  },

  // Row
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -4,
  },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.hair,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxOn: { backgroundColor: C.lime, borderColor: C.ink },
  rememberText: { fontSize: 12, color: C.inkSoft, fontWeight: "800" },
  termsText: { fontSize: 12, color: C.inkSoft, fontWeight: "700", flex: 1 },
  termsLink: { fontWeight: "900", color: C.limeDeep, textDecorationLine: "underline" },
  forgotText: {
    fontSize: 12,
    color: C.ink,
    fontWeight: "900",
    textDecorationLine: "underline",
  },

  // Submit
  submit: {
    height: 60,
    borderRadius: 22,
    backgroundColor: C.ink,
    overflow: "hidden",
  },
  submitInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 22,
    paddingRight: 6,
  },
  submitText: {
    color: C.lime,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  submitArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.inkSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.lime,
  },
  submitShine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 120,
  },
  submitLoad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  submitLoadText: {
    color: C.lime,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  loadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.lime,
  },

  // Confetti
  confettiWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Divider
  divider: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  divLine: { flex: 1, height: 1, backgroundColor: C.hair },
  divBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.hair,
  },
  divBadgeText: {
    fontSize: 10,
    color: C.mute,
    fontWeight: "900",
    letterSpacing: 2,
  },

  // Social
  socialRow: { flexDirection: "row", gap: 10 },
  social: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  socialLight: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.ink,
  },
  socialDark: { backgroundColor: C.ink },
  socialText: { fontSize: 14, fontWeight: "900", letterSpacing: -0.3 },
  googleG: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.ink,
    justifyContent: "center",
    alignItems: "center",
  },
  googleGText: {
    fontSize: 11,
    color: C.lime,
    fontWeight: "900",
  },

  // Switch row
  switchRow: { marginTop: 22, alignItems: "center" },
  switchText: { fontSize: 13, color: C.inkSoft, fontWeight: "700" },
  switchLink: {
    color: C.ink,
    fontWeight: "900",
    textDecorationLine: "underline",
  },

  // Footer
  footer: { marginTop: 22, alignItems: "center" },
  footerText: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "800",
    color: C.mute,
  },
});
