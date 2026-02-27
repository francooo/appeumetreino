import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import type { Workout, WorkoutHistory, Exercise } from "@/lib/storage";

export default function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const { addWorkoutHistory } = useApp();
  const params = useLocalSearchParams<{ workout: string }>();
  const workout: Workout = (() => {
    try {
      return JSON.parse(params.workout || "{}");
    } catch {
      return {} as Workout;
    }
  })();
  const exercises = workout.exercises || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIndices, setCompletedIndices] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const currentExercise = exercises[currentIndex];
  const allCompleted = completedIndices.size === exercises.length;
  const progress = exercises.length > 0 ? completedIndices.size / exercises.length : 0;

  useEffect(() => {
    if (currentExercise && !timerStarted) {
      setTimeLeft(currentExercise.duration);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused]);

  const startTimer = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsRunning(true);
    setIsPaused(false);
    setTimerStarted(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
  }, []);

  const completeExercise = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const newCompleted = new Set(completedIndices);
    newCompleted.add(currentIndex);
    setCompletedIndices(newCompleted);

    if (newCompleted.size === exercises.length) {
      return;
    }

    let nextIdx = currentIndex + 1;
    while (nextIdx < exercises.length && newCompleted.has(nextIdx)) {
      nextIdx++;
    }
    if (nextIdx < exercises.length) {
      setCurrentIndex(nextIdx);
      setTimeLeft(exercises[nextIdx].duration);
      setIsRunning(false);
      setIsPaused(false);
      setTimerStarted(false);
    }
  }, [currentIndex, completedIndices, exercises]);

  const handleFinishWorkout = useCallback(async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const entry: WorkoutHistory = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      workoutId: workout.id,
      workoutName: workout.name,
      completedAt: Date.now(),
      duration: parseInt(workout.duration) || 30,
    };
    await addWorkoutHistory(entry);
    Alert.alert("Parabens!", "Treino concluido com sucesso!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  }, [workout, addWorkoutHistory]);

  const handleBack = useCallback(() => {
    if (completedIndices.size > 0 && !allCompleted) {
      Alert.alert(
        "Sair do treino?",
        "Seu progresso sera perdido. Deseja sair?",
        [
          { text: "Continuar", style: "cancel" },
          { text: "Sair", style: "destructive", onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  }, [completedIndices, allCompleted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const selectExercise = (idx: number) => {
    if (completedIndices.has(idx)) return;
    setCurrentIndex(idx);
    setTimeLeft(exercises[idx].duration);
    setIsRunning(false);
    setIsPaused(false);
    setTimerStarted(false);
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "web" ? 67 : insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backBtn} testID="back-button">
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{workout.name}</Text>
          <Text style={styles.headerSubtitle}>
            {completedIndices.size}/{exercises.length} exercicios
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>

      {allCompleted ? (
        <View style={styles.completedContainer}>
          <View style={styles.completedIconBg}>
            <Ionicons name="trophy" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.completedTitle}>Treino Concluido!</Text>
          <Text style={styles.completedSubtitle}>
            Voce completou todos os {exercises.length} exercicios
          </Text>
          <Pressable
            onPress={handleFinishWorkout}
            style={({ pressed }) => [styles.finishBtn, pressed && { opacity: 0.8 }]}
            testID="finish-workout-button"
          >
            <Text style={styles.finishBtnText}>Salvar e Finalizar</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {currentExercise && (
            <View style={styles.timerSection}>
              <Text style={styles.currentExName}>{currentExercise.name}</Text>
              <Text style={styles.currentExMeta}>
                {currentExercise.sets} series x {currentExercise.reps} reps
              </Text>
              <Text style={styles.timerDisplay}>{formatTime(timeLeft)}</Text>
              <View style={styles.timerControls}>
                {!timerStarted ? (
                  <Pressable
                    onPress={startTimer}
                    style={({ pressed }) => [styles.timerBtn, styles.startBtn, pressed && { opacity: 0.8 }]}
                    testID="start-timer-button"
                  >
                    <Ionicons name="play" size={24} color="#fff" />
                    <Text style={styles.timerBtnText}>Iniciar</Text>
                  </Pressable>
                ) : isPaused ? (
                  <Pressable
                    onPress={resumeTimer}
                    style={({ pressed }) => [styles.timerBtn, styles.startBtn, pressed && { opacity: 0.8 }]}
                  >
                    <Ionicons name="play" size={24} color="#fff" />
                    <Text style={styles.timerBtnText}>Retomar</Text>
                  </Pressable>
                ) : isRunning ? (
                  <Pressable
                    onPress={pauseTimer}
                    style={({ pressed }) => [styles.timerBtn, styles.pauseBtn, pressed && { opacity: 0.8 }]}
                  >
                    <Ionicons name="pause" size={24} color="#fff" />
                    <Text style={styles.timerBtnText}>Pausar</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={completeExercise}
                  disabled={timeLeft > 0}
                  style={({ pressed }) => [
                    styles.timerBtn,
                    styles.completeBtn,
                    timeLeft > 0 && styles.disabledBtn,
                    pressed && { opacity: 0.8 },
                  ]}
                  testID="complete-exercise-button"
                >
                  <Ionicons name="checkmark" size={24} color="#fff" />
                  <Text style={styles.timerBtnText}>Concluir</Text>
                </Pressable>
              </View>
            </View>
          )}

          <ScrollView
            ref={scrollRef}
            style={styles.exerciseList}
            contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
          >
            {exercises.map((ex: Exercise, idx: number) => {
              const isCompleted = completedIndices.has(idx);
              const isCurrent = idx === currentIndex;
              return (
                <Pressable
                  key={idx}
                  onPress={() => selectExercise(idx)}
                  disabled={isCompleted}
                  style={[
                    styles.trailItem,
                    isCurrent && styles.trailItemActive,
                    isCompleted && styles.trailItemCompleted,
                  ]}
                  testID={`exercise-trail-${idx}`}
                >
                  <View style={styles.trailLeft}>
                    <View style={[
                      styles.trailDot,
                      isCurrent && styles.trailDotActive,
                      isCompleted && styles.trailDotCompleted,
                    ]}>
                      {isCompleted ? (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      ) : (
                        <Text style={[styles.trailDotText, isCurrent && styles.trailDotTextActive]}>
                          {idx + 1}
                        </Text>
                      )}
                    </View>
                    {idx < exercises.length - 1 && (
                      <View style={[
                        styles.trailLine,
                        isCompleted && styles.trailLineCompleted,
                      ]} />
                    )}
                  </View>
                  <View style={styles.trailContent}>
                    <Text style={[
                      styles.trailName,
                      isCompleted && styles.trailNameCompleted,
                    ]}>{ex.name}</Text>
                    <Text style={styles.trailDetail}>
                      {ex.sets} series x {ex.reps} reps · {ex.equipment}
                    </Text>
                  </View>
                  {isCurrent && !isCompleted && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Atual</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 18,
    color: Colors.text,
  },
  headerSubtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  headerRight: {
    width: 40,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  timerSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 8,
  },
  currentExName: {
    fontFamily: "Rubik_700Bold",
    fontSize: 22,
    color: Colors.text,
    textAlign: "center",
  },
  currentExMeta: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  timerDisplay: {
    fontFamily: "Rubik_700Bold",
    fontSize: 56,
    color: Colors.primary,
    marginVertical: 8,
  },
  timerControls: {
    flexDirection: "row",
    gap: 12,
  },
  timerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  startBtn: {
    backgroundColor: Colors.primary,
  },
  pauseBtn: {
    backgroundColor: Colors.warning,
  },
  completeBtn: {
    backgroundColor: Colors.success,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  timerBtnText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 16,
    color: "#fff",
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  trailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    minHeight: 60,
  },
  trailItemActive: {
    backgroundColor: "rgba(0, 200, 83, 0.06)",
    borderRadius: 14,
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  trailItemCompleted: {
    opacity: 0.6,
  },
  trailLeft: {
    alignItems: "center",
    width: 32,
    marginRight: 12,
  },
  trailDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  trailDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  trailDotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  trailDotText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 12,
    color: Colors.textMuted,
  },
  trailDotTextActive: {
    color: "#fff",
  },
  trailLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  trailLineCompleted: {
    backgroundColor: Colors.success,
  },
  trailContent: {
    flex: 1,
    gap: 2,
    paddingTop: 2,
  },
  trailName: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
    color: Colors.text,
  },
  trailNameCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  trailDetail: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  currentBadge: {
    backgroundColor: "rgba(0, 200, 83, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "center",
  },
  currentBadgeText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 12,
    color: Colors.primary,
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  completedIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(0, 200, 83, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  completedTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 28,
    color: Colors.text,
  },
  completedSubtitle: {
    fontFamily: "Rubik_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  finishBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
  },
  finishBtnText: {
    fontFamily: "Rubik_700Bold",
    fontSize: 18,
    color: "#fff",
  },
});
