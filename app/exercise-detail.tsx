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
import Icon, { type IconName } from "@/components/Icon";
import { useApp } from "@/contexts/AppContext";
import type { Exercise, Workout } from "@/lib/storage";
import { getExerciseImage } from "@/lib/workout-generator";
import { PrimaryButton } from "@/components/ui/Buttons";
import { BackButton } from "@/components/ui/Layout";

function Metric({ icon, value, label }: { icon: IconName; value: string; label?: string }) {
  return (
    <View style={styles.metric}>
      <Icon name={icon} size={30} color={Colors.secondary} strokeWidth={2.4} />
      <Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {label ? <Text style={styles.metricLabel}>{label}</Text> : null}
    </View>
  );
}

export default function ExerciseDetailScreen() {
  const insets = useSafeAreaInsets();
  const { level } = useApp();
  const params = useLocalSearchParams<{ exercise: string; index?: string }>();
  const exercise: Exercise = (() => {
    try {
      return JSON.parse(params.exercise || "{}");
    } catch {
      return {} as Exercise;
    }
  })();

  const position = params.index ? Number(params.index) + 1 : null;
  const instructionSteps = (exercise.instructions || "")
    .split("\n")
    .filter(Boolean)
    .map((s) => s.replace(/^\d+\.\s*/, ""));
  const exerciseImage = getExerciseImage(exercise.name, exercise.equipment);
  const minutes = exercise.duration ? Math.max(1, Math.round(exercise.duration / 60)) : null;

  // Abre o cronometro so com este exercicio (mesmo formato de treino usado no app)
  const handleStart = () => {
    const single: Workout = {
      id: `exercise-${Date.now()}`,
      name: exercise.name,
      exercises: [exercise],
      level: level || "beginner",
      createdAt: Date.now(),
      duration: minutes ? `${minutes} min` : "",
    };
    router.push({ pathname: "/active-workout", params: { workout: JSON.stringify(single) } });
  };

  const openYoutube = () => {
    const query = encodeURIComponent(`${exercise.name} exercicio como fazer`);
    Linking.openURL(`https://www.youtube.com/results?search_query=${query}`).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 8,
            paddingBottom: 120 + (Platform.OS === "web" ? 34 : insets.bottom),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <BackButton onPress={() => router.back()} shape="circle" />
          <Text style={styles.kicker}>
            {position ? `EXERCÍCIO ${String(position).padStart(2, "0")}` : "EXERCÍCIO"}
          </Text>
          <View style={styles.brand}>
            <Text style={styles.brandText}>{"EU ME\nTREINO"}</Text>
            <View style={styles.brandLine} />
          </View>
        </View>

        <View style={styles.media}>
          {exerciseImage ? (
            <Image source={exerciseImage} style={styles.mediaImage} resizeMode="cover" />
          ) : (
            <Icon name="dumbbell" size={64} color={Colors.primary} />
          )}
        </View>

        <Text style={styles.name}>{exercise.name}</Text>
        <View style={styles.nameLine} />

        <View style={styles.metrics}>
          <Metric icon="refresh" value={String(exercise.sets ?? "-")} label="séries" />
          <View style={styles.metricDivider} />
          <Metric icon="dumbbell" value={String(exercise.reps ?? "-")} label="reps" />
          <View style={styles.metricDivider} />
          <Metric icon="clock" value={`${exercise.restSeconds ?? "-"} s`} label="pausa" />
          <View style={styles.metricDivider} />
          <Metric icon="activity" value={minutes ? `${minutes} min` : "--"} label="duração" />
        </View>

        <View style={styles.separator} />
        <View style={styles.tag}>
          <Icon name="dumbbell" size={20} color={Colors.onPrimary} strokeWidth={2.6} />
          <Text style={styles.tagText}>{(exercise.equipment || "").toUpperCase()}</Text>
        </View>

        {exercise.weight ? (
          <View style={styles.weight}>
            <Text style={styles.weightLabel}>Peso sugerido</Text>
            <Text style={styles.weightValue}>{exercise.weight}</Text>
            <Text style={styles.weightHint}>
              Ajuste para que as últimas repetições sejam desafiadoras, sem perder a postura.
            </Text>
          </View>
        ) : null}

        <View style={styles.separator} />
        <View style={styles.sectionHeader}>
          <Icon name="list" size={28} color={Colors.secondary} strokeWidth={2.2} />
          <Text style={styles.sectionTitle}>Execução</Text>
        </View>
        {instructionSteps.map((step, idx) => (
          <View key={idx} style={[styles.step, idx > 0 && styles.stepBorder]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{idx + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}

        <Pressable
          onPress={openYoutube}
          style={({ pressed }) => [styles.video, pressed && { opacity: 0.8 }]}
          accessibilityRole="link"
          testID="youtube-button"
        >
          <Ionicons name="logo-youtube" size={24} color="#FF0000" />
          <Text style={styles.videoText}>Ver vídeo no YouTube</Text>
          <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
        <PrimaryButton
          label="Iniciar exercício"
          leadingIcon="play"
          trailingIcon="chevron-right"
          onPress={handleStart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  kicker: {
    flex: 1,
    fontFamily: "Rubik_500Medium",
    fontSize: 13,
    letterSpacing: 3,
    color: Colors.text,
  },
  brand: {
    alignItems: "flex-start",
  },
  brandText: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 13,
    lineHeight: 15,
    color: Colors.text,
  },
  brandLine: {
    width: 26,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  media: {
    height: 260,
    marginTop: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.heroDark,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  name: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 34,
    lineHeight: 40,
    color: Colors.text,
    marginTop: 20,
  },
  nameLine: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  metrics: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  metric: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  metricValue: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 24,
    color: Colors.text,
  },
  metricLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.text,
  },
  metricDivider: {
    width: 1,
    height: 70,
    backgroundColor: Colors.border,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  tagText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 14,
    letterSpacing: 2,
    color: Colors.onPrimary,
  },
  weight: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  weightLabel: {
    fontFamily: "Rubik_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 24,
    color: Colors.text,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  stepBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 18,
    color: Colors.onPrimary,
  },
  stepText: {
    flex: 1,
    fontFamily: "Rubik_400Regular",
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
  },
  video: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  videoText: {
    flex: 1,
    fontFamily: "Rubik_500Medium",
    fontSize: 15,
    color: Colors.text,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
  },
});
