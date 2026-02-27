import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { generateWorkout } from "@/lib/workout-generator";
import type { Exercise } from "@/lib/storage";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    user,
    level,
    equipment,
    workouts,
    history,
    saveUserWorkout,
  } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);

  const latestWorkout = workouts.length > 0 ? workouts[workouts.length - 1] : null;

  const handleNewWorkout = async () => {
    if (equipment.length === 0) {
      Alert.alert("Sem equipamentos", "Adicione equipamentos primeiro.");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsGenerating(true);
    setTimeout(async () => {
      const workout = generateWorkout(equipment, level || "beginner");
      await saveUserWorkout(workout);
      setIsGenerating(false);
    }, 1000);
  };

  const handleStartWorkout = () => {
    if (!latestWorkout) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push({
      pathname: "/active-workout",
      params: { workout: JSON.stringify(latestWorkout) },
    });
  };

  const handleExerciseDetail = (exercise: Exercise) => {
    router.push({
      pathname: "/exercise-detail",
      params: { exercise: JSON.stringify(exercise) },
    });
  };

  const handleEquipmentPress = () => {
    if (latestWorkout) {
      const workoutEquipment = [
        ...new Set(latestWorkout.exercises.map((ex) => ex.equipment)),
      ];
      router.push({
        pathname: "/(tabs)/add-equipment",
        params: { workoutEquipment: JSON.stringify(workoutEquipment) },
      });
    } else {
      router.push("/(tabs)/add-equipment");
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 100,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.userName}>{user?.name || "Atleta"}</Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/profile")}
          style={styles.avatarBtn}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {(user?.name || "A").charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <Pressable
          style={styles.statCard}
          onPress={handleEquipmentPress}
          testID="equipment-card"
        >
          <LinearGradient
            colors={["rgba(0, 200, 83, 0.15)", "rgba(0, 200, 83, 0.05)"]}
            style={styles.statGradient}
          >
            <Ionicons name="barbell" size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{equipment.length}</Text>
            <Text style={styles.statLabel}>Equipamentos</Text>
          </LinearGradient>
        </Pressable>
        <View style={styles.statCard}>
          <LinearGradient
            colors={["rgba(0, 188, 212, 0.15)", "rgba(0, 188, 212, 0.05)"]}
            style={styles.statGradient}
          >
            <Ionicons name="list" size={20} color={Colors.secondary} />
            <Text style={styles.statValue}>{workouts.length}</Text>
            <Text style={styles.statLabel}>Treinos</Text>
          </LinearGradient>
        </View>
        <View style={styles.statCard}>
          <LinearGradient
            colors={["rgba(124, 77, 255, 0.15)", "rgba(124, 77, 255, 0.05)"]}
            style={styles.statGradient}
          >
            <Ionicons name="checkmark-done" size={20} color="#7C4DFF" />
            <Text style={styles.statValue}>{history.length}</Text>
            <Text style={styles.statLabel}>Completos</Text>
          </LinearGradient>
        </View>
      </View>

      {latestWorkout ? (
        <View style={styles.todayCard}>
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.todayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.todayContent}>
              <Text style={styles.todayLabel}>Treino do dia</Text>
              <Text style={styles.todayName}>{latestWorkout.name}</Text>
              <View style={styles.todayMeta}>
                <View style={styles.todayMetaItem}>
                  <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.todayMetaText}>
                    {latestWorkout.duration}
                  </Text>
                </View>
                <View style={styles.todayMetaItem}>
                  <Ionicons
                    name="barbell"
                    size={14}
                    color="rgba(255,255,255,0.8)"
                  />
                  <Text style={styles.todayMetaText}>
                    {latestWorkout.exercises.length} exercicios
                  </Text>
                </View>
              </View>
            </View>
            <Pressable
              onPress={handleStartWorkout}
              style={({ pressed }) => [
                styles.todayStartBtn,
                pressed && { opacity: 0.8 },
              ]}
              testID="start-workout-button"
            >
              <Ionicons name="play" size={24} color={Colors.primary} />
            </Pressable>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="barbell-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Nenhum treino ainda</Text>
          <Text style={styles.emptySubtitle}>
            Gere seu primeiro treino personalizado
          </Text>
        </View>
      )}

      <Pressable
        onPress={handleNewWorkout}
        disabled={isGenerating}
        style={({ pressed }) => [
          styles.generateBtn,
          pressed && styles.generateBtnPressed,
          isGenerating && styles.generateBtnDisabled,
        ]}
      >
        <View style={styles.generateBtnInner}>
          <Ionicons
            name={isGenerating ? "hourglass" : "sparkles"}
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.generateBtnText}>
            {isGenerating ? "Gerando..." : "Gerar novo treino"}
          </Text>
        </View>
      </Pressable>

      {latestWorkout && (
        <>
          <Text style={styles.sectionTitle}>Exercicios de hoje</Text>
          {latestWorkout.exercises.map((ex, idx) => (
            <Pressable
              key={idx}
              style={({ pressed }) => [
                styles.exerciseRow,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleExerciseDetail(ex)}
              testID={`exercise-item-${idx}`}
            >
              <View style={styles.exerciseIdx}>
                <Text style={styles.exerciseIdxText}>{idx + 1}</Text>
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseRowName}>{ex.name}</Text>
                <Text style={styles.exerciseRowDetail}>
                  {ex.sets} series x {ex.reps} reps
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </Pressable>
          ))}
        </>
      )}

      {history.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Historico recente</Text>
          {history.slice(0, 5).map((h) => (
            <View key={h.id} style={styles.historyRow}>
              <View style={styles.historyIcon}>
                <Ionicons name="checkmark" size={16} color={Colors.success} />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyName}>{h.workoutName}</Text>
                <Text style={styles.historyDate}>
                  {new Date(h.completedAt).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <Text style={styles.historyDuration}>{h.duration} min</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  userName: {
    fontFamily: "Rubik_700Bold",
    fontSize: 26,
    color: Colors.text,
  },
  avatarBtn: {
    borderRadius: 22,
    overflow: "hidden",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 18,
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  statGradient: {
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderRadius: 14,
  },
  statValue: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
  },
  todayCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  todayGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  todayContent: {
    flex: 1,
    gap: 6,
  },
  todayLabel: {
    fontFamily: "Rubik_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  todayName: {
    fontFamily: "Rubik_700Bold",
    fontSize: 20,
    color: "#fff",
  },
  todayMeta: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  todayMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  todayMetaText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  todayStartBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.text,
    marginTop: 4,
  },
  emptySubtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  generateBtn: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: "rgba(0, 200, 83, 0.08)",
    marginBottom: 28,
  },
  generateBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
  },
  generateBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.primary,
  },
  sectionTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 18,
    color: Colors.text,
    marginBottom: 14,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseIdx: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  exerciseIdxText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 13,
    color: Colors.primary,
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseRowName: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  exerciseRowDetail: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  exerciseEquipment: {
    fontFamily: "Rubik_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  historyInfo: {
    flex: 1,
    gap: 2,
  },
  historyName: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  historyDate: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  historyDuration: {
    fontFamily: "Rubik_500Medium",
    fontSize: 14,
    color: Colors.textMuted,
  },
});
