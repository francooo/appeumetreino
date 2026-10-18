import type { MealType } from "./storage";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

export const MEAL_TYPE_LABEL: Record<MealType, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  snack: "Lanche",
  dinner: "Jantar",
};

// Sugestao de tipo pelo horario, quando a IA nao indicar
export function mealTypeForHour(hour: number): MealType {
  if (hour < 10) return "breakfast";
  if (hour < 15) return "lunch";
  if (hour < 18) return "snack";
  return "dinner";
}
