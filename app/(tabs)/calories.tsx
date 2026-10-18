import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import Colors from "@/constants/colors";
import Icon from "@/components/Icon";
import AppHeader from "@/components/AppHeader";
import ProgressRing from "@/components/ui/ProgressRing";
import NumberPrompt from "@/components/ui/NumberPrompt";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { Sparks } from "@/components/ui/Layout";
import { useApp } from "@/contexts/AppContext";
import { useCalories } from "@/hooks/useCalories";
import { setSelectedMeal } from "@/lib/mealSelection";
import {
  addDays,
  formatDayLong,
  formatRelativeDay,
  formatTime,
  formatWeekdayShort,
  todayKey,
} from "@/lib/dates";
import type { Meal, WeightEntry } from "@/lib/storage";
import { MEAL_TYPE_LABEL } from "@/lib/meals";

const formatNumber = (n: number) => n.toLocaleString("pt-BR");
const formatKg = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Linha do peso nos ultimos 7 dias (pontos so nos dias com registro)
function WeightChart({ entries, width }: { entries: WeightEntry[]; width: number }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(todayKey(), i - 6));
  const height = 90;
  const padX = 12;
  const padY = 12;
  const byDay = new Map(entries.map((e) => [e.day, e.kg]));
  const values = entries.map((e) => e.kg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const x = (i: number) => padX + (i * (width - padX * 2)) / 6;
  const y = (kg: number) => padY + ((max - kg) / range) * (height - padY * 2);

  const points = days
    .map((d, i) => (byDay.has(d) ? { x: x(i), y: y(byDay.get(d)!), today: d === todayKey() } : null))
    .filter(Boolean) as { x: number; y: number; today: boolean }[];
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area =
    points.length > 1
      ? `${line} L${points[points.length - 1].x},${height} L${points[0].x},${height} Z`
      : "";

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.secondary} stopOpacity={0.18} />
            <Stop offset="1" stopColor={Colors.secondary} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {area ? <Path d={area} fill="url(#weightFill)" /> : null}
        {points.length > 1 ? (
          <Path d={line} stroke={Colors.secondary} strokeWidth={3} fill="none" strokeLinejoin="round" />
        ) : null}
        {points.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.today ? 7 : 5}
            fill={p.today ? Colors.secondary : Colors.card}
            stroke={Colors.secondary}
            strokeWidth={3}
          />
        ))}
      </Svg>
      <View style={[styles.chartLabels, { width }]}>
        {days.map((d) => (
          <Text key={d} style={[styles.chartLabel, d === todayKey() && styles.chartLabelToday]}>
            {formatWeekdayShort(d)}
          </Text>
        ))}
      </View>
    </View>
  );
}

function MealRow({ meal, onPress }: { meal: Meal; onPress: () => void }) {
  const day = formatRelativeDay(meal.day);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.mealRow, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
      accessibilityLabel={`${MEAL_TYPE_LABEL[meal.mealType]}, ${meal.kcal} quilocalorias`}
    >
      {meal.photo ? (
        <Image source={{ uri: meal.photo }} style={styles.mealThumb} />
      ) : (
        <View style={[styles.mealThumb, styles.mealThumbEmpty]}>
          <Icon name="plate" size={30} color={Colors.textSecondary} />
        </View>
      )}
      <View style={styles.mealInfo}>
        <Text style={styles.mealTitle} numberOfLines={1}>
          {MEAL_TYPE_LABEL[meal.mealType]} · {formatNumber(meal.kcal)} kcal
        </Text>
        <Text style={styles.mealName} numberOfLines={1}>
          {meal.name}
        </Text>
        <Text style={styles.mealTime}>
          {day.charAt(0).toUpperCase() + day.slice(1)}, {formatTime(meal.eatenAt)}
        </Text>
      </View>
      <View style={styles.chevron}>
        <Icon name="chevron-right" size={20} color={Colors.text} />
      </View>
    </Pressable>
  );
}

export default function CaloriesScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { updateCalorieGoal } = useApp();
  const [day, setDay] = useState(todayKey());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [goalPromptOpen, setGoalPromptOpen] = useState(false);
  const [weightPromptOpen, setWeightPromptOpen] = useState(false);
  const { meals, weights, latestWeight, goal, total, progress, isLoading, error, saveWeight } =
    useCalories(day);

  const isToday = day === todayKey();
  const percent = Math.round(progress * 100);
  const recentDays = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(todayKey(), -i)), []);

  // Variacao do peso entre o primeiro e o ultimo registro da semana
  const weightDelta =
    weights.length >= 2 ? Math.round((weights[weights.length - 1].kg - weights[0].kg) * 10) / 10 : null;
  const chartWidth = Math.min(screenWidth - 40 - 40, 360);

  const openMealEntry = (mode: "photo" | "manual") => {
    setSelectedMeal(null);
    router.push({ pathname: "/meal-entry", params: { mode, day } });
  };

  const openMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    router.push({ pathname: "/meal-entry", params: { mode: "edit", day: meal.day } });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 12,
            paddingBottom: Platform.OS === "web" ? 34 + 90 : insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader />

        <View style={styles.titleRow}>
          <Text style={styles.title}>Medidor de calorias</Text>
          <Sparks size={44} style={styles.titleSparks} />
        </View>

        <Pressable
          onPress={() => setDatePickerOpen(true)}
          style={({ pressed }) => [styles.dateChip, pressed && { opacity: 0.8 }]}
          accessibilityRole="button"
          accessibilityLabel={`Data: ${formatDayLong(day)}. Alterar data`}
        >
          <Icon name="calendar" size={24} color={Colors.text} />
          <Text style={styles.dateText}>{formatDayLong(day)}</Text>
          <Icon name="chevron-down" size={20} color={Colors.text} strokeWidth={2.2} />
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Consumo do dia */}
        <View style={styles.card}>
          <View style={styles.consumptionTop}>
            <View style={styles.consumptionText}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardIcon, { backgroundColor: Colors.limeSoft }]}>
                  <Icon name="utensils" size={26} color={Colors.text} strokeWidth={2.2} />
                </View>
                <Text style={styles.cardTitle}>{isToday ? "Consumo de hoje" : "Consumo do dia"}</Text>
              </View>
              {isLoading ? (
                <ActivityIndicator color={Colors.secondary} style={{ marginVertical: 24 }} />
              ) : (
                <Text style={styles.kcalValue} numberOfLines={1} adjustsFontSizeToFit>
                  {formatNumber(total)} <Text style={styles.kcalUnit}>kcal</Text>
                </Text>
              )}
              <Pressable
                onPress={() => setGoalPromptOpen(true)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Meta diária ${goal} quilocalorias. Alterar meta`}
              >
                <Text style={styles.goalText}>
                  Meta diária {formatNumber(goal)} kcal <Text style={styles.goalEdit}>· alterar</Text>
                </Text>
              </Pressable>
            </View>
            <ProgressRing value={progress} size={128} stroke={14}>
              <Text style={styles.ringValue}>
                {percent}
                <Text style={styles.ringPercent}>%</Text>
              </Text>
              <Text style={styles.ringLabel}>do objetivo</Text>
            </ProgressRing>
          </View>

          <View style={styles.barRow}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.min(progress, 1) * 100}%` }]} />
            </View>
            <Text style={styles.barPercent}>{percent}%</Text>
          </View>

          <PrimaryButton
            label="Fotografar refeição"
            leadingIcon="camera"
            trailingIcon={null}
            onPress={() => openMealEntry("photo")}
          />
          <Pressable
            onPress={() => openMealEntry("manual")}
            style={styles.manualLink}
            accessibilityRole="button"
          >
            <Icon name="edit" size={24} color={Colors.secondary} />
            <Text style={styles.manualText}>Registrar manualmente</Text>
          </Pressable>
          <Text style={styles.note}>A estimativa pode ser ajustada antes de salvar.</Text>

          {meals.length > 0 ? (
            <View style={styles.mealList}>
              {meals.map((meal) => (
                <MealRow key={meal.id} meal={meal} onPress={() => openMeal(meal)} />
              ))}
            </View>
          ) : !isLoading ? (
            <View style={styles.emptyMeals}>
              <Icon name="plate" size={28} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Nenhuma refeição registrada neste dia.</Text>
            </View>
          ) : null}
        </View>

        {/* Peso corporal */}
        <View style={[styles.card, styles.weightCard]}>
          <View style={styles.weightHeader}>
            <View style={styles.cardTitleRow}>
              <View style={[styles.cardIcon, { backgroundColor: Colors.primaryLight }]}>
                <Icon name="scale" size={26} color={Colors.text} strokeWidth={2.2} />
              </View>
              <Text style={styles.cardTitle}>Peso corporal</Text>
            </View>
            {weightDelta !== null && weightDelta !== 0 ? (
              <View style={styles.deltaBadge}>
                <Icon
                  name={weightDelta < 0 ? "arrow-down" : "arrow-up"}
                  size={20}
                  color={weightDelta < 0 ? Colors.success : Colors.error}
                  strokeWidth={2.6}
                />
                <View>
                  <Text style={[styles.deltaValue, { color: weightDelta < 0 ? Colors.success : Colors.error }]}>
                    {weightDelta > 0 ? "+" : ""}
                    {formatKg(weightDelta)} kg
                  </Text>
                  <Text style={styles.deltaLabel}>em 7 dias</Text>
                </View>
              </View>
            ) : null}
          </View>

          {latestWeight ? (
            <>
              <Text style={styles.weightValue}>
                {formatKg(latestWeight.kg)} <Text style={styles.weightUnit}>kg</Text>
              </Text>
              <Text style={styles.weightSub}>Último registro: {formatRelativeDay(latestWeight.day)}</Text>
            </>
          ) : (
            <Text style={styles.weightSub}>Registre seu peso para acompanhar a evolução.</Text>
          )}

          {weights.length > 0 ? <WeightChart entries={weights} width={chartWidth} /> : null}

          <SecondaryButton
            label="Registrar peso"
            icon="scale"
            onPress={() => setWeightPromptOpen(true)}
          />
        </View>
      </ScrollView>

      {/* Escolha do dia */}
      <Modal visible={datePickerOpen} transparent animationType="fade" onRequestClose={() => setDatePickerOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setDatePickerOpen(false)}>
          <View style={styles.dateSheet}>
            <Text style={styles.dateSheetTitle}>Escolha o dia</Text>
            <ScrollView style={{ maxHeight: 420 }}>
              {recentDays.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => {
                    setDay(d);
                    setDatePickerOpen(false);
                  }}
                  style={({ pressed }) => [styles.dateOption, pressed && { opacity: 0.7 }]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: d === day }}
                >
                  <Text style={[styles.dateOptionText, d === day && styles.dateOptionSelected]}>
                    {formatDayLong(d)}
                  </Text>
                  {d === day ? <Icon name="check" size={22} color={Colors.secondary} strokeWidth={2.6} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <NumberPrompt
        visible={goalPromptOpen}
        title="Meta diária de calorias"
        label="Meta (kcal)"
        icon="target"
        initialValue={String(goal)}
        suffix="kcal"
        min={800}
        max={6000}
        onCancel={() => setGoalPromptOpen(false)}
        onSubmit={async (value) => {
          await updateCalorieGoal(value);
          setGoalPromptOpen(false);
        }}
      />

      <NumberPrompt
        visible={weightPromptOpen}
        title="Registrar peso de hoje"
        label="Peso (kg)"
        icon="scale"
        initialValue={latestWeight ? formatKg(latestWeight.kg) : ""}
        suffix="kg"
        allowDecimal
        min={20}
        max={400}
        onCancel={() => setWeightPromptOpen(false)}
        onSubmit={async (value) => {
          await saveWeight(value);
          setWeightPromptOpen(false);
        }}
      />
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
  titleRow: {
    paddingRight: 44,
  },
  title: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 32,
    lineHeight: 38,
    color: Colors.text,
  },
  titleSparks: {
    position: "absolute",
    right: 0,
    top: -12,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 18,
    marginTop: 14,
    marginBottom: 16,
    borderRadius: 26,
    backgroundColor: Colors.backgroundLight,
  },
  dateText: {
    fontFamily: "Rubik_500Medium",
    fontSize: 17,
    color: Colors.text,
  },
  error: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.error,
    marginBottom: 12,
  },
  card: {
    padding: 18,
    marginBottom: 16,
    gap: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  consumptionTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  consumptionText: {
    flex: 1,
    gap: 6,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 19,
    color: Colors.text,
  },
  kcalValue: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 44,
    color: Colors.text,
  },
  kcalUnit: {
    fontSize: 30,
  },
  goalText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  goalEdit: {
    fontFamily: "Rubik_600SemiBold",
    color: Colors.secondary,
  },
  ringValue: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 30,
    color: Colors.text,
  },
  ringPercent: {
    fontSize: 20,
  },
  ringLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  barTrack: {
    flex: 1,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.progressTrack,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 7,
    backgroundColor: Colors.secondary,
  },
  barPercent: {
    fontFamily: "Rubik_500Medium",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  manualLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 44,
  },
  manualText: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 17,
    color: Colors.secondary,
  },
  note: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: -8,
  },
  mealList: {
    gap: 10,
  },
  mealRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  mealThumb: {
    width: 76,
    height: 60,
    borderRadius: 12,
  },
  mealThumbEmpty: {
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  mealInfo: {
    flex: 1,
    gap: 2,
  },
  mealTitle: {
    fontFamily: "Rubik_700Bold",
    fontSize: 16,
    color: Colors.text,
  },
  mealName: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  mealTime: {
    fontFamily: "Rubik_400Regular",
    fontSize: 13,
    color: Colors.textMuted,
  },
  chevron: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyMeals: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
  },
  emptyText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },
  weightCard: {
    backgroundColor: "#F6FBE5",
    borderColor: "#E4EFC4",
  },
  weightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  deltaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.card,
  },
  deltaValue: {
    fontFamily: "Rubik_600SemiBold",
    fontSize: 15,
  },
  deltaLabel: {
    fontFamily: "Rubik_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  weightValue: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 44,
    color: Colors.text,
  },
  weightUnit: {
    fontSize: 30,
  },
  weightSub: {
    fontFamily: "Rubik_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: -10,
  },
  chartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  chartLabel: {
    width: 36,
    textAlign: "center",
    fontFamily: "Rubik_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartLabelToday: {
    fontFamily: "Rubik_700Bold",
    color: Colors.text,
  },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17,19,24,0.45)",
  },
  dateSheet: {
    padding: 24,
    paddingBottom: 36,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.background,
  },
  dateSheetTitle: {
    fontFamily: "Rubik_800ExtraBold",
    fontSize: 22,
    color: Colors.text,
    marginBottom: 8,
  },
  dateOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dateOptionText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 17,
    color: Colors.text,
  },
  dateOptionSelected: {
    fontFamily: "Rubik_700Bold",
    color: Colors.secondary,
  },
});
