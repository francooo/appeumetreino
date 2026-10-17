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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import Icon from "@/components/Icon";
import { useApp } from "@/contexts/AppContext";
import { generateWorkout } from "@/lib/workout-generator";

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const { level, equipment, workouts, history, saveUserWorkout } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);

  const sortedWorkouts = [...workouts].sort((a, b) => b.createdAt - a.createdAt);

  const handleNewWorkout = async () => {
    if (equipment.length === 0) {
      Alert.alert("Sem equipamentos", "Adicione equipamentos primeiro.", [
        { text: "Cancelar", style: "cancel" },
        { text: "Adicionar", onPress: () => router.push("/add-equipment") },
      ]);
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsGenerating(true);
    try {
      const workout = generateWorkout(equipment, level || "beginner");
      await saveUserWorkout(workout);
      router.push({ pathname: "/workout-result", params: { workoutId: workout.id } });
    } finally {
      setIsGenerating(false);
    }
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
      <Text style={styles.title}>Treinos</Text>
      <Text style={styles.subtitle}>Seus treinos gerados e concluídos</Text>

      <Pressable
        onPress={handleNewWorkout}
        disabled={isGenerating}
        style={({ pressed }) => [
          styles.primaryBtn,
          pressed && styles.pressed,
          isGenerating && styles.disabled,
        ]}
        accessibilityRole="button"
      >
        <Icon name="plus" size={20} color={Colors.onPrimary} strokeWidth={2.2} />
        <Text style={styles.primaryBtnText}>
          {isGenerating ? "Gerando..." : "Gerar novo treino"}
        </Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Seus treinos</Text>
      {sortedWorkouts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Icon name="list" size={28} color={Colors.textSecondary} />
          <Text style={styles.emptyTitle}>Nenhum treino ainda</Text>
          <Text style={styles.emptyText}>
            Gere seu primeiro treino com os equipamentos que você tem.
          </Text>
        </View>
      ) : (
        sortedWorkouts.map((w) => (
          <Pressable
            key={w.id}
            onPress={() =>
              router.push({ pathname: "/workout-result", params: { workoutId: w.id } })
            }
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Abrir treino ${w.name}`}
          >
            <View style={[styles.rowIcon, { backgroundColor: Colors.limeSoft }]}>
              <Icon name="dumbbell" size={20} color={Colors.text} strokeWidth={2.2} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>{w.name}</Text>
              <Text style={styles.rowMeta}>
                {w.duration} · {w.exercises.length} exercícios
              </Text>
            </View>
            <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
          </Pressable>
        ))
      )}

      {history.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Concluídos</Text>
          {history.slice(0, 10).map((h) => (
            <View key={h.id} style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: Colors.cobaltSoft }]}>
                <Icon name="check-circle" size={20} color={Colors.secondary} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>{h.workoutName}</Text>
                <Text style={styles.rowMeta}>
                  {new Date(h.completedAt).toLocaleDateString("pt-BR")} · {h.duration} min
                </Text>
              </View>
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
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 32,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
  },
  primaryBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.onPrimary,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
    marginTop: 32,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 10,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  rowMeta: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyCard: {
    alignItems: "center",
    gap: 8,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  emptyTitle: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  emptyText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
