import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { apiRequest } from "@/lib/query-client";
import { useApp } from "@/contexts/AppContext";
import { addDays, todayKey } from "@/lib/dates";
import type { Meal, MealType, WeightEntry } from "@/lib/storage";

export interface MealDraft {
  day: string;
  eatenAt: string;
  mealType: MealType;
  name: string;
  kcal: number;
  photo: string | null;
  items: { name: string; kcal: number }[] | null;
}

// Refeicoes do dia escolhido e pesos dos ultimos 7 dias, direto do servidor (Neon)
export function useCalories(day: string) {
  const { user } = useApp();
  const userId = user?.id;
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [latestWeight, setLatestWeight] = useState<WeightEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const goal = user?.calorieGoal || 2000;
  const total = meals.reduce((sum, m) => sum + m.kcal, 0);
  const progress = goal > 0 ? total / goal : 0;

  const load = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      const to = todayKey();
      const from = addDays(to, -6);
      const [mealsRes, weightsRes] = await Promise.all([
        apiRequest("GET", `/api/user/${userId}/meals?day=${day}`).then((r) => r.json()),
        apiRequest("GET", `/api/user/${userId}/weights?from=${from}&to=${to}`).then((r) => r.json()),
      ]);
      setMeals(mealsRes);
      setWeights(weightsRes.entries || []);
      setLatestWeight(weightsRes.latest || null);
    } catch (e) {
      console.error("Load calories error:", e);
      setError("Não foi possível carregar seus dados. Verifique sua conexão.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, day]);

  // Carrega ao abrir, ao trocar de dia e ao voltar da tela de refeicao
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const saveWeight = useCallback(
    async (kg: number) => {
      if (!userId) return;
      await apiRequest("POST", `/api/user/${userId}/weights`, { day: todayKey(), kg });
      await load();
    },
    [userId, load],
  );

  return { meals, weights, latestWeight, goal, total, progress, isLoading, error, reload: load, saveWeight };
}

// Operacoes de refeicao usadas pela tela de registro/edicao
export function useMealActions() {
  const { user } = useApp();
  const userId = user?.id;

  const addMeal = useCallback(
    async (meal: MealDraft) => {
      if (!userId) throw new Error("Usuario nao autenticado");
      await apiRequest("POST", `/api/user/${userId}/meals`, meal);
    },
    [userId],
  );

  const updateMeal = useCallback(
    async (mealId: string, meal: MealDraft) => {
      if (!userId) throw new Error("Usuario nao autenticado");
      await apiRequest("PUT", `/api/user/${userId}/meals/${mealId}`, meal);
    },
    [userId],
  );

  const deleteMeal = useCallback(
    async (mealId: string) => {
      if (!userId) throw new Error("Usuario nao autenticado");
      await apiRequest("DELETE", `/api/user/${userId}/meals/${mealId}`);
    },
    [userId],
  );

  return { addMeal, updateMeal, deleteMeal };
}
