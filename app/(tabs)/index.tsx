import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import Icon, { type IconName } from "@/components/Icon";
import Avatar from "@/components/Avatar";
import { useApp } from "@/contexts/AppContext";
import { generateWorkout, getExerciseImage, swapExercise } from "@/lib/workout-generator";
import type { Exercise } from "@/lib/storage";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function MetricCard({
  icon,
  iconBg,
  iconColor,
  value,
  label,
  onPress,
}: {
  icon: IconName;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.metricCard, pressed && styles.pressed]}
      accessibilityLabel={`${value} ${label}`}
    >
      <View style={[styles.metricIcon, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={22} color={iconColor} strokeWidth={2.4} />
      </View>
      <View style={styles.metricText}>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, level, equipment, workouts, history, saveUserWorkout, updateUserWorkout } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);

  // Treino mais recente pela data de criacao (a ordem vinda do servidor nao e garantida)
  const latestWorkout =
    workouts.length > 0
      ? workouts.reduce((a, b) => ((b.createdAt || 0) >= (a.createdAt || 0) ? b : a))
      : null;
  const firstName = (user?.name || "Atleta").split(" ")[0];
  const nextExercises = latestWorkout?.exercises ?? [];
  const firstExercise = latestWorkout?.exercises[0];
  const heroImage = firstExercise
    ? getExerciseImage(firstExercise.name, firstExercise.equipment)
    : null;

  const completed = history.length;
  const total = Math.max(workouts.length, completed);
  const progress = total > 0 ? Math.min(completed / total, 1) : 0;

  // Nome do treino em duas linhas, com a ultima palavra destacada em verde-lima
  const nameWords = (latestWorkout?.name || "").split(" ");
  const nameHighlight = nameWords.length > 1 ? nameWords.pop() : "";
  const nameMain = nameWords.join(" ");

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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwap = async (index: number) => {
    if (!latestWorkout || swappingIndex !== null) return;
    const updated = swapExercise(latestWorkout, index, equipment, level || "beginner");
    if (!updated) {
      Alert.alert(
        "Sem alternativas",
        "Não há outro exercício disponível com seus equipamentos.",
      );
      return;
    }
    setSwappingIndex(index);
    try {
      await updateUserWorkout(updated);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } finally {
      setSwappingIndex(null);
    }
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

  const handleExerciseDetail = (exercise: Exercise, index: number) => {
    router.push({
      pathname: "/exercise-detail",
      params: { exercise: JSON.stringify(exercise), index: String(index) },
    });
  };

  const handleEquipmentPress = () => {
    if (latestWorkout) {
      const workoutEquipment = [
        ...new Set(latestWorkout.exercises.map((ex) => ex.equipment)),
      ];
      router.push({
        pathname: "/add-equipment",
        params: { workoutEquipment: JSON.stringify(workoutEquipment) },
      });
    } else {
      router.push("/add-equipment");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
          paddingBottom: Platform.OS === "web" ? 34 + 90 : insets.bottom + 110,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabecalho: marca + avatar */}
      <View style={styles.header}>
        <View style={styles.brand}>
          <Icon name="dumbbell" size={40} color={Colors.primary} strokeWidth={3.2} />
          <Text style={styles.brandName}>{"Meu\nTreinador"}</Text>
          <View style={styles.brandDivider} />
          <Text style={styles.brandTagline} numberOfLines={2}>
            {"DISCIPLINA HOJE,\nRESULTADOS SEMPRE."}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/profile")}
          style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
        >
          <Avatar user={user} size={52} />
          <View style={styles.avatarStatus} />
        </Pressable>
      </View>

      {/* Saudacao + atalho de equipamentos */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingText}>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.userName} numberOfLines={1} adjustsFontSizeToFit>
            {firstName}
          </Text>
          <View style={styles.nameUnderline} />
        </View>
        <Pressable
          onPress={handleEquipmentPress}
          style={({ pressed }) => [styles.equipmentPill, pressed && styles.pressed]}
          accessibilityRole="button"
          testID="equipment-card"
        >
          <Icon name="dumbbell" size={20} color={Colors.onPrimary} strokeWidth={2.4} />
          <Text style={styles.equipmentPillText}>Equipamentos</Text>
          <Icon name="chevron-right" size={18} color={Colors.onPrimary} strokeWidth={2.4} />
        </Pressable>
      </View>

      {/* Metricas */}
      <View style={styles.metricsRow}>
        <MetricCard
          icon="dumbbell"
          iconBg={Colors.limeSoft}
          iconColor={Colors.text}
          value={equipment.length}
          label="Equipamentos"
          onPress={handleEquipmentPress}
        />
        <MetricCard
          icon="list"
          iconBg={Colors.cobaltSoft}
          iconColor={Colors.secondary}
          value={workouts.length}
          label="Treinos"
          onPress={() => router.push("/(tabs)/workouts")}
        />
        <MetricCard
          icon="trophy"
          iconBg={Colors.limeSoft}
          iconColor={Colors.text}
          value={history.length}
          label="Completos"
        />
      </View>

      {/* Treino de hoje */}
      <View style={styles.hero}>
        {heroImage ? (
          <>
            <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
            {/* Escurece a borda esquerda da ilustracao para o texto continuar legivel */}
            <LinearGradient
              colors={[Colors.heroDark, "rgba(17,19,24,0)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.heroFade}
              pointerEvents="none"
            />
          </>
        ) : null}
        <View style={styles.heroStripes} pointerEvents="none">
          <View style={[styles.stripe, { right: 150 }]} />
          <View style={[styles.stripe, styles.stripeThin, { right: 120 }]} />
        </View>
        <View style={styles.heroContent}>
          <View style={styles.heroLabelRow}>
            <View style={styles.heroLabelIcon}>
              <Icon name="calendar" size={18} color={Colors.onPrimary} strokeWidth={2.2} />
            </View>
            <Text style={styles.heroLabel}>Seu treino de hoje</Text>
          </View>

          {latestWorkout ? (
            <>
              <Text style={styles.heroTitle} numberOfLines={2}>
                {nameMain}
                {nameHighlight ? (
                  <Text style={styles.heroTitleHighlight}>{`\n${nameHighlight}`}</Text>
                ) : null}
              </Text>
              <View style={styles.heroMeta}>
                <Icon name="clock" size={18} color="#FFFFFF" />
                <Text style={styles.heroMetaText}>{latestWorkout.duration}</Text>
                <Text style={styles.heroMetaDot}>•</Text>
                <Icon name="dumbbell" size={18} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.heroMetaText}>
                  {latestWorkout.exercises.length} exercícios
                </Text>
              </View>
              <Pressable
                onPress={handleStartWorkout}
                style={({ pressed }) => [styles.heroBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                testID="start-workout-button"
              >
                <Icon name="play" size={20} color={Colors.onPrimary} strokeWidth={2.4} />
                <Text style={styles.heroBtnText}>Começar agora</Text>
                <Icon name="chevron-right" size={18} color={Colors.onPrimary} strokeWidth={2.4} />
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.heroTitle}>
                Gere seu
                <Text style={styles.heroTitleHighlight}>{"\nprimeiro treino"}</Text>
              </Text>
              <Text style={styles.heroEmptyText}>
                Montamos um treino com os equipamentos que você tem.
              </Text>
              <Pressable
                onPress={handleNewWorkout}
                disabled={isGenerating}
                style={({ pressed }) => [
                  styles.heroBtn,
                  pressed && styles.pressed,
                  isGenerating && styles.disabled,
                ]}
                accessibilityRole="button"
              >
                <Icon name="plus" size={20} color={Colors.onPrimary} strokeWidth={2.4} />
                <Text style={styles.heroBtnText}>
                  {isGenerating ? "Gerando..." : "Gerar treino"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
        <Text style={styles.heroSlogan} pointerEvents="none">
          {"MAIS\nFORTE\nHOJE"}
        </Text>
      </View>

      {/* Gerar outro treino (o cartao acima ja oferece isso quando nao ha treino) */}
      {latestWorkout && (
        <Pressable
          onPress={handleNewWorkout}
          disabled={isGenerating}
          style={({ pressed }) => [
            styles.generateBtn,
            pressed && styles.pressed,
            isGenerating && styles.disabled,
          ]}
          accessibilityRole="button"
          testID="generate-workout-button"
        >
          <Icon name="plus" size={20} color={Colors.text} strokeWidth={2.2} />
          <Text style={styles.generateBtnText}>
            {isGenerating ? "Gerando..." : "Gerar novo treino"}
          </Text>
        </Pressable>
      )}

      {/* Progresso */}
      {workouts.length > 0 && (
        <View style={styles.progressCard}>
          <View>
            <Text style={styles.progressValue}>
              {completed} de {total}
            </Text>
            <Text style={styles.progressLabel}>treinos concluídos</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
        </View>
      )}

      {/* Na sequencia */}
      {latestWorkout && nextExercises.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Na sequência</Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/workout-result",
                  params: { workoutId: latestWorkout.id },
                })
              }
              style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text style={styles.seeAllText}>Ver todos</Text>
              <Icon name="chevron-right" size={18} color={Colors.secondary} strokeWidth={2.4} />
            </Pressable>
          </View>

          {nextExercises.map((ex, idx) => {
            const thumb = getExerciseImage(ex.name, ex.equipment);
            return (
              <Pressable
                key={idx}
                onPress={() => handleExerciseDetail(ex, idx)}
                style={({ pressed }) => [styles.exerciseRow, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={`${ex.name}, ${ex.sets} séries de ${ex.reps}`}
                testID={`exercise-item-${idx}`}
              >
                <View style={styles.thumbWrap}>
                  {thumb ? (
                    <Image source={thumb} style={styles.thumb} resizeMode="cover" />
                  ) : null}
                  <View style={styles.thumbIndex}>
                    <Text style={styles.thumbIndexText}>{idx + 1}</Text>
                  </View>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName} numberOfLines={2}>
                    {ex.name}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {ex.sets} séries × {ex.reps} reps
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleSwap(idx)}
                  disabled={swappingIndex !== null}
                  style={({ pressed }) => [styles.swapBtn, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`Trocar ${ex.name}`}
                  hitSlop={6}
                  testID={`swap-exercise-${idx}`}
                >
                  {swappingIndex === idx ? (
                    <ActivityIndicator size="small" color={Colors.text} />
                  ) : (
                    <Icon name="refresh" size={20} color={Colors.text} strokeWidth={2.2} />
                  )}
                </Pressable>
                <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
              </Pressable>
            );
          })}
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
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  brandName: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 19,
    lineHeight: 20,
    color: Colors.text,
  },
  brandDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  brandTagline: {
    flexShrink: 1,
    fontFamily: "Rubik_500Medium",
    fontSize: 9,
    letterSpacing: 1.6,
    lineHeight: 14,
    color: Colors.textSecondary,
  },
  avatar: {
    width: 52,
    height: 52,
    marginLeft: 8,
  },
  avatarStatus: {
    position: "absolute",
    right: 1,
    bottom: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.background,
  },

  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontFamily: "Rubik_400Regular",
    fontSize: 20,
    color: Colors.text,
  },
  userName: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 38,
    lineHeight: 44,
    color: Colors.text,
  },
  nameUnderline: {
    width: 84,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 2,
    transform: [{ rotate: "-2deg" }],
  },
  equipmentPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: Colors.primary,
  },
  equipmentPillText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.onPrimary,
  },

  metricsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  metricText: {
    flex: 1,
  },
  metricValue: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 24,
    color: Colors.text,
  },
  metricLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 11,
    color: Colors.textSecondary,
  },

  hero: {
    backgroundColor: Colors.heroDark,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 12,
    minHeight: 260,
  },
  heroImage: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: -40,
    width: "70%",
    opacity: 0.9,
  },
  heroFade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: "30%",
    width: "30%",
  },
  heroStripes: {
    ...StyleSheet.absoluteFillObject,
  },
  stripe: {
    position: "absolute",
    top: -40,
    width: 26,
    height: 400,
    backgroundColor: Colors.primary,
    opacity: 0.85,
    transform: [{ rotate: "28deg" }],
  },
  stripeThin: {
    width: 10,
    opacity: 0.6,
  },
  heroContent: {
    padding: 20,
    width: "68%",
    gap: 12,
  },
  heroLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroLabelIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroLabel: {
    fontFamily: "Rubik_500Medium",
    fontSize: 15,
    color: "#FFFFFF",
  },
  heroTitle: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 32,
    lineHeight: 36,
    color: "#FFFFFF",
  },
  heroTitleHighlight: {
    color: Colors.primary,
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  heroMetaText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: "#FFFFFF",
  },
  heroMetaDot: {
    color: "#FFFFFF",
    marginHorizontal: 2,
  },
  heroEmptyText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.8)",
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 50,
    paddingHorizontal: 16,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  heroBtnText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 16,
    color: Colors.onPrimary,
  },
  heroSlogan: {
    position: "absolute",
    right: 14,
    bottom: 14,
    fontFamily: "Rubik_800ExtraBold",
    fontStyle: "italic",
    fontSize: 13,
    lineHeight: 15,
    color: "#FFFFFF",
    textAlign: "right",
    transform: [{ rotate: "-6deg" }],
  },

  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.text,
    backgroundColor: Colors.card,
    marginBottom: 12,
  },
  generateBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: Colors.text,
  },
  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 24,
  },
  progressValue: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 20,
    color: Colors.text,
  },
  progressLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.progressTrack,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: Colors.secondary,
  },
  progressPercent: {
    fontFamily: "Rubik_500Medium",
    fontSize: 14,
    color: Colors.textSecondary,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 24,
    color: Colors.text,
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    minHeight: 44,
  },
  seeAllText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 15,
    color: Colors.secondary,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 10,
    marginBottom: 10,
  },
  thumbWrap: {
    width: 76,
    height: 60,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.heroDark,
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  thumbIndex: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.cobaltSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbIndexText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 13,
    color: Colors.secondary,
  },
  exerciseInfo: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontFamily: "Rubik_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  exerciseMeta: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  swapBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.limeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
});
