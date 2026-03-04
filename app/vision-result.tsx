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
import MuscleMap from "@/components/MuscleMap";
import type { Equipment } from "@/lib/storage";

interface SuggestedExercise {
  name: string;
  description: string;
  muscles_primary: string[];
  muscles_secondary: string[];
  sets: number;
  reps: string;
  rest_seconds: number;
}

interface VisionResult {
  equipment_name: string;
  confidence: number;
  low_confidence: boolean;
  suggested_exercises: SuggestedExercise[];
}

export default function VisionResultScreen() {
  const insets = useSafeAreaInsets();
  const { addUserEquipment, equipment, saveUserWorkout, visionResult, setVisionResult } = useApp();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [addedEquipment, setAddedEquipment] = useState(false);

  const data: VisionResult | null = visionResult;

  if (!data) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={styles.errorText}>Erro ao carregar resultado</Text>
        <Pressable onPress={() => router.back()} style={styles.retryBtn}>
          <Text style={styles.retryBtnText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const selectedExercise = data.suggested_exercises[selectedIdx];
  const alreadyHasEquipment = equipment.some(
    (e) => e.name.toLowerCase() === data.equipment_name.toLowerCase()
  );

  const handleAddEquipment = async () => {
    if (alreadyHasEquipment || addedEquipment) {
      Alert.alert("Ja adicionado", "Este equipamento ja esta na sua lista.");
      return;
    }
    const item: Equipment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: data.equipment_name,
      imageUri: "",
      addedAt: Date.now(),
    };
    await addUserEquipment(item);
    setAddedEquipment(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert("Adicionado", `${data.equipment_name} foi adicionado aos seus equipamentos.`);
  };

  const handleStartWorkout = async () => {
    const workout = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `Treino - ${data.equipment_name}`,
      exercises: data.suggested_exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
        reps: typeof ex.reps === "number" ? String(ex.reps) : ex.reps,
        rest: `${ex.rest_seconds}s`,
        equipment: data.equipment_name,
        instructions: ex.description,
        mediaUrl: "",
        duration: 0,
      })),
      duration: `${Math.round(data.suggested_exercises.length * 5)} min`,
      level: "intermediate",
      equipment: [data.equipment_name],
      createdAt: Date.now(),
    };

    await saveUserWorkout(workout);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.replace({
      pathname: "/active-workout",
      params: { workout: JSON.stringify(workout) },
    });
  };

  const confidenceColor =
    data.confidence >= 80
      ? Colors.success
      : data.confidence >= 60
        ? Colors.warning
        : Colors.error;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top,
          paddingBottom: Platform.OS === "web" ? 34 + 20 : insets.bottom + 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Resultado</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.equipmentCard}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={styles.equipmentGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.equipmentIcon}>
            <Ionicons name="fitness" size={28} color="#fff" />
          </View>
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>{data.equipment_name}</Text>
            <View style={styles.confidenceRow}>
              <View
                style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}
              >
                <Text style={styles.confidenceText}>{data.confidence}%</Text>
              </View>
              <Text style={styles.confidenceLabel}>confianca</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.sectionTitle}>
        Exercicios sugeridos ({data.suggested_exercises.length})
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exerciseScroll}
      >
        {data.suggested_exercises.map((ex, idx) => (
          <Pressable
            key={idx}
            onPress={() => {
              setSelectedIdx(idx);
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
            }}
            style={[
              styles.exerciseCard,
              idx === selectedIdx && styles.exerciseCardActive,
            ]}
            testID={`exercise-card-${idx}`}
          >
            <Text
              style={[
                styles.exerciseCardName,
                idx === selectedIdx && styles.exerciseCardNameActive,
              ]}
              numberOfLines={2}
            >
              {ex.name}
            </Text>
            <View style={styles.exerciseCardMeta}>
              <Text style={styles.exerciseCardMetaText}>
                {ex.sets}x{ex.reps}
              </Text>
            </View>
            <View style={styles.muscleTagsRow}>
              {ex.muscles_primary.slice(0, 2).map((m, i) => (
                <View key={i} style={styles.muscleTag}>
                  <Text style={styles.muscleTagText} numberOfLines={1}>
                    {m}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {selectedExercise && (
        <>
          <View style={styles.detailCard}>
            <Text style={styles.detailName}>{selectedExercise.name}</Text>

            <View style={styles.detailStatsRow}>
              <View style={styles.detailStat}>
                <Ionicons name="repeat" size={16} color={Colors.primary} />
                <Text style={styles.detailStatValue}>{selectedExercise.sets}</Text>
                <Text style={styles.detailStatLabel}>series</Text>
              </View>
              <View style={styles.detailStat}>
                <Ionicons name="fitness" size={16} color={Colors.secondary} />
                <Text style={styles.detailStatValue}>{selectedExercise.reps}</Text>
                <Text style={styles.detailStatLabel}>reps</Text>
              </View>
              <View style={styles.detailStat}>
                <Ionicons name="time" size={16} color={Colors.warning} />
                <Text style={styles.detailStatValue}>
                  {selectedExercise.rest_seconds}s
                </Text>
                <Text style={styles.detailStatLabel}>descanso</Text>
              </View>
            </View>

            <Text style={styles.detailDescTitle}>Instrucoes</Text>
            <Text style={styles.detailDesc}>{selectedExercise.description}</Text>
          </View>

          <Text style={styles.sectionTitle}>Musculos trabalhados</Text>
          <View style={styles.muscleMapCard}>
            <MuscleMap
              primaryMuscles={selectedExercise.muscles_primary}
              secondaryMuscles={selectedExercise.muscles_secondary}
            />
          </View>
        </>
      )}

      <View style={styles.actionsContainer}>
        <Pressable
          onPress={handleAddEquipment}
          disabled={alreadyHasEquipment || addedEquipment}
          style={({ pressed }) => [
            styles.addEquipmentBtn,
            pressed && { opacity: 0.8 },
            (alreadyHasEquipment || addedEquipment) && { opacity: 0.5 },
          ]}
          testID="add-equipment-button"
        >
          <Ionicons
            name={alreadyHasEquipment || addedEquipment ? "checkmark-circle" : "add-circle-outline"}
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.addEquipmentText}>
            {alreadyHasEquipment || addedEquipment
              ? "Equipamento adicionado"
              : "Adicionar equipamento"}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleStartWorkout}
          style={({ pressed }) => [
            styles.startWorkoutBtn,
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
          ]}
          testID="start-workout-button"
        >
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.startWorkoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="play" size={22} color="#fff" />
            <Text style={styles.startWorkoutText}>Iniciar treino</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingTop: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 18,
    color: Colors.text,
  },
  equipmentCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
  },
  equipmentGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  equipmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  equipmentInfo: {
    flex: 1,
    gap: 6,
  },
  equipmentName: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: "#fff",
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  confidenceText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 13,
    color: "#fff",
  },
  confidenceLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  sectionTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 18,
    color: Colors.text,
    marginBottom: 14,
  },
  exerciseScroll: {
    paddingBottom: 4,
    gap: 10,
    marginBottom: 20,
  },
  exerciseCard: {
    width: 150,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 8,
  },
  exerciseCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(0, 200, 83, 0.08)",
  },
  exerciseCardName: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
  exerciseCardNameActive: {
    color: Colors.primary,
  },
  exerciseCardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseCardMetaText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  muscleTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  muscleTag: {
    backgroundColor: "rgba(0, 188, 212, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  muscleTagText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 11,
    color: Colors.secondary,
  },
  detailCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  detailName: {
    fontFamily: "Rubik_700Bold",
    fontSize: 20,
    color: Colors.text,
  },
  detailStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
  },
  detailStat: {
    alignItems: "center",
    gap: 4,
  },
  detailStatValue: {
    fontFamily: "Rubik_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  detailStatLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailDescTitle: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  detailDesc: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  muscleMapCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  addEquipmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  addEquipmentText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.primary,
  },
  startWorkoutBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  startWorkoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startWorkoutText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 16,
    color: "#fff",
  },
  errorText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.error,
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
  },
  retryBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 14,
    color: Colors.text,
  },
});
