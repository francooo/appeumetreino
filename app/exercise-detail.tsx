import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import type { Exercise } from "@/lib/storage";
import { getExerciseImage } from "@/lib/workout-generator";

export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ exercise: string }>();
  const exercise: Exercise = (() => {
    try {
      return JSON.parse(params.exercise || "{}");
    } catch {
      return {} as Exercise;
    }
  })();

  const instructionSteps = (exercise.instructions || "").split("\n").filter(Boolean);
  const exerciseImage = getExerciseImage(exercise.name, exercise.equipment);

  const formatDuration = (seconds: number) => {
    if (!seconds) return "--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="back-button">
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Detalhes</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mediaArea}>
          {exerciseImage ? (
            <Image
              source={exerciseImage}
              style={styles.mediaImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.mediaPlaceholder}>
              <Ionicons name="fitness" size={56} color={Colors.primary} />
              <Text style={styles.mediaText}>Imagem indisponivel</Text>
            </View>
          )}
        </View>

        <Text style={styles.exerciseName}>{exercise.name}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="repeat" size={18} color={Colors.primary} />
            <Text style={styles.statValue}>{exercise.sets}</Text>
            <Text style={styles.statLabel}>Series</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="barbell" size={18} color={Colors.secondary} />
            <Text style={styles.statValue}>{exercise.reps}</Text>
            <Text style={styles.statLabel}>Reps</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="timer" size={18} color={Colors.warning} />
            <Text style={styles.statValue}>{exercise.restSeconds}s</Text>
            <Text style={styles.statLabel}>Descanso</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time" size={18} color="#7C4DFF" />
            <Text style={styles.statValue}>{formatDuration(exercise.duration)}</Text>
            <Text style={styles.statLabel}>Duracao</Text>
          </View>
        </View>

        {exercise.weight ? (
          <View style={styles.weightCard}>
            <Ionicons name="barbell" size={20} color={Colors.primary} />
            <View style={styles.weightContent}>
              <Text style={styles.statLabel}>Peso sugerido</Text>
              <Text style={styles.weightValue}>{exercise.weight}</Text>
              <Text style={styles.weightHint}>
                Ajuste para que as ultimas repeticoes sejam desafiadoras, sem perder a postura.
              </Text>
            </View>
          </View>
        ) : null}

        <View style={styles.equipmentTag}>
          <Ionicons name="fitness" size={16} color={Colors.primary} />
          <Text style={styles.equipmentTagText}>{exercise.equipment}</Text>
        </View>

        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Passo a passo</Text>
          {instructionSteps.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepDot}>
                <Text style={styles.stepDotText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step.replace(/^\d+\.\s*/, "")}</Text>
            </View>
          ))}
        </View>

        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>Video demonstrativo</Text>
          <Pressable
            onPress={() => {
              const query = encodeURIComponent(`${exercise.name} exercicio como fazer`);
              const url = `https://www.youtube.com/results?search_query=${query}`;
              Linking.canOpenURL(url).then((supported) => {
                if (supported) Linking.openURL(url);
              }).catch(() => {});
            }}
            style={({ pressed }) => [styles.videoBtn, pressed && { opacity: 0.8 }]}
            testID="youtube-button"
          >
            <Ionicons name="logo-youtube" size={24} color="#FF0000" />
            <Text style={styles.videoBtnText}>Assistir no YouTube</Text>
            <Ionicons name="open-outline" size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    flex: 1,
    fontFamily: "Rubik_700Bold",
    fontSize: 18,
    color: Colors.text,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  mediaArea: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  mediaImage: {
    width: "100%",
    height: 220,
    borderRadius: 20,
  },
  mediaPlaceholder: {
    height: 220,
    backgroundColor: Colors.card,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mediaText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textMuted,
  },
  exerciseName: {
    fontFamily: "Rubik_700Bold",
    fontSize: 26,
    color: Colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  weightCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weightContent: {
    flex: 1,
    gap: 2,
  },
  weightValue: {
    fontFamily: "Rubik_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  weightHint: {
    fontFamily: "Rubik_400Regular",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontFamily: "Rubik_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  equipmentTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.limeSoft,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 24,
  },
  equipmentTagText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 14,
    color: Colors.primary,
  },
  instructionsSection: {
    gap: 12,
  },
  videoSection: {
    marginTop: 28,
    gap: 12,
  },
  videoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  videoBtnText: {
    flex: 1,
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  sectionTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 20,
    color: Colors.text,
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  stepDotText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 13,
    color: Colors.primary,
  },
  stepText: {
    flex: 1,
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
