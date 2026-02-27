import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

export default function WorkoutResultScreen() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { workouts } = useApp();
  const insets = useSafeAreaInsets();

  const workout = workouts.find((w) => w.id === workoutId);

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.replace("/(tabs)");
  };

  if (!workout) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Treino nao encontrado</Text>
        <Pressable onPress={() => router.replace("/(tabs)")}>
          <Text style={styles.linkText}>Ir para Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 20,
            paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successBadge}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.successGradient}
          >
            <Ionicons name="checkmark" size={32} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Treino pronto!</Text>
        <Text style={styles.subtitle}>
          Seu treino personalizado foi criado com sucesso
        </Text>

        <View style={styles.workoutCard}>
          <LinearGradient
            colors={[Colors.card, Colors.cardLight]}
            style={styles.workoutCardGradient}
          >
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <View style={styles.workoutMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={16} color={Colors.primary} />
                  <Text style={styles.metaText}>{workout.duration}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="barbell" size={16} color={Colors.secondary} />
                  <Text style={styles.metaText}>
                    {workout.exercises.length} exercicios
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>
                {workout.level === "beginner"
                  ? "Iniciante"
                  : workout.level === "intermediate"
                    ? "Intermediario"
                    : "Avancado"}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Exercicios</Text>

        {workout.exercises.map((exercise, idx) => (
          <View key={idx} style={styles.exerciseCard}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{idx + 1}</Text>
            </View>
            <View style={styles.exerciseContent}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.exerciseDetails}>
                <View style={styles.detailChip}>
                  <Text style={styles.detailLabel}>Series</Text>
                  <Text style={styles.detailValue}>{exercise.sets}</Text>
                </View>
                <View style={styles.detailChip}>
                  <Text style={styles.detailLabel}>Reps</Text>
                  <Text style={styles.detailValue}>{exercise.reps}</Text>
                </View>
                <View style={styles.detailChip}>
                  <Text style={styles.detailLabel}>Descanso</Text>
                  <Text style={styles.detailValue}>
                    {exercise.restSeconds}s
                  </Text>
                </View>
              </View>
              <View style={styles.equipmentTag}>
                <Ionicons name="fitness" size={12} color={Colors.primary} />
                <Text style={styles.equipmentTagText}>
                  {exercise.equipment}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 },
        ]}
      >
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.startBtn,
            pressed && styles.startBtnPressed,
          ]}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.startGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="play" size={22} color="#fff" />
            <Text style={styles.startText}>Iniciar treino</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 16,
    color: Colors.textSecondary,
  },
  linkText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 16,
  },
  successGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Rubik_700Bold",
    color: Colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Rubik_400Regular",
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  workoutCard: {
    width: "100%",
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  workoutCardGradient: {
    padding: 20,
  },
  workoutHeader: {
    gap: 12,
  },
  workoutName: {
    fontSize: 22,
    fontFamily: "Rubik_700Bold",
    color: Colors.text,
  },
  workoutMeta: {
    flexDirection: "row",
    gap: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  levelBadge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(0, 200, 83, 0.15)",
  },
  levelText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 13,
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Rubik_700Bold",
    color: Colors.text,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  exerciseCard: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseNumberText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 14,
    color: Colors.primary,
  },
  exerciseContent: {
    flex: 1,
    gap: 8,
  },
  exerciseName: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: 8,
  },
  detailChip: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  detailLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 11,
    color: Colors.textMuted,
  },
  detailValue: {
    fontFamily: "Rubik_700Bold",
    fontSize: 14,
    color: Colors.text,
  },
  equipmentTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  equipmentTagText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  startBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  startGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  startText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 17,
    color: "#fff",
  },
});
