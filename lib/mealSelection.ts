import type { Meal } from "./storage";

// Refeicao aberta para edicao. Passada por memoria em vez de parametro de rota
// porque a miniatura em base64 deixaria a URL grande demais.
let selectedMeal: Meal | null = null;

export function setSelectedMeal(meal: Meal | null) {
  selectedMeal = meal;
}

export function getSelectedMeal(): Meal | null {
  return selectedMeal;
}
