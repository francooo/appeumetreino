import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "@/contexts/AppContext";
import Colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SplashScreen() {
  const { isLoading, isOnboarded, user, level, equipment } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (!isOnboarded) {
        router.replace("/onboarding");
      } else if (!user) {
        router.replace("/(auth)/login");
      } else if (!level) {
        router.replace("/level-select");
      } else if (equipment.length === 0) {
        router.replace("/equipment-capture");
      } else {
        router.replace("/(tabs)");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, isOnboarded, user, level, equipment]);

  const dotOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <LinearGradient
      colors={[Colors.background, "#0D1526", Colors.backgroundLight]}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
        <Animated.View
          style={[
            styles.logoContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.iconCircle}>
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.dumbbellIcon}>
                <View style={styles.dumbbellWeight} />
                <View style={styles.dumbbellBar} />
                <View style={styles.dumbbellWeight} />
              </View>
            </LinearGradient>
          </View>

          <Text style={styles.title}>Eu me treino</Text>
          <Text style={styles.subtitle}>
            Seu treino personalizado com o que{"\n"}voce tem em casa
          </Text>
        </Animated.View>

        <Animated.View style={[styles.loadingContainer, { opacity: dotOpacity }]}>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            <View style={[styles.dot, { backgroundColor: Colors.accent }]} />
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    gap: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 8,
  },
  iconGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dumbbellIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dumbbellWeight: {
    width: 14,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  dumbbellBar: {
    width: 28,
    height: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  title: {
    fontSize: 36,
    fontFamily: "Rubik_700Bold",
    color: Colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Rubik_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 100,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
