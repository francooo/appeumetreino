import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { generateWorkout } from "@/lib/workout-generator";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProcessingScreen() {
  const { equipment, level, saveUserWorkout } = useApp();
  const insets = useSafeAreaInsets();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const workout = generateWorkout(equipment, level || "beginner");
      await saveUserWorkout(workout);
      router.replace({
        pathname: "/workout-result",
        params: { workoutId: workout.id },
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, [equipment, level]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <LinearGradient
      colors={[Colors.background, "#0D1526", Colors.backgroundLight]}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
        <Animated.View
          style={[styles.spinnerOuter, { transform: [{ rotate: spin }] }]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary, Colors.accent]}
            style={styles.spinnerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.spinnerInner} />
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.pulseIcon, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.pulseGradient}
          >
            <View style={styles.processingDumbbell}>
              <View style={styles.pWeight} />
              <View style={styles.pBar} />
              <View style={styles.pWeight} />
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Analisando seus{"\n"}equipamentos...</Text>
          <Text style={styles.subtitle}>
            Estamos criando seu treino personalizado
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth as any }]}>
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.progressGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
        </View>

        <View style={styles.steps}>
          <StepItem text="Identificando equipamentos" delay={0} />
          <StepItem text="Calculando exercicios" delay={1200} />
          <StepItem text="Montando seu treino" delay={2400} />
        </View>
      </View>
    </LinearGradient>
  );
}

function StepItem({ text, delay }: { text: string; delay: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Animated.View style={[styles.stepRow, { opacity: fadeAnim }]}>
      <View style={styles.stepDot} />
      <Text style={styles.stepText}>{text}</Text>
    </Animated.View>
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
    paddingHorizontal: 40,
  },
  spinnerOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    padding: 4,
    position: "absolute",
  },
  spinnerGradient: {
    flex: 1,
    borderRadius: 70,
    padding: 4,
  },
  spinnerInner: {
    flex: 1,
    borderRadius: 70,
    backgroundColor: Colors.background,
  },
  pulseIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 32,
  },
  pulseGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  processingDumbbell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  pWeight: {
    width: 10,
    height: 28,
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  pBar: {
    width: 20,
    height: 6,
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: "Rubik_700Bold",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Rubik_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 32,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
  },
  progressGradient: {
    flex: 1,
  },
  steps: {
    gap: 16,
    alignSelf: "flex-start",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  stepText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
  },
});
