import type { Equipment, Exercise, Level, Workout } from "./storage";

interface ExerciseTemplate {
  name: string;
  equipment: string;
  sets: { beginner: number; intermediate: number; advanced: number };
  reps: { beginner: string; intermediate: string; advanced: string };
  rest: { beginner: number; intermediate: number; advanced: number };
}

const EQUIPMENT_EXERCISES: Record<string, ExerciseTemplate[]> = {
  dumbbell: [
    {
      name: "Rosca Biceps",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Desenvolvimento de Ombros",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Remada Unilateral",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Agachamento com Halteres",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Supino com Halteres",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Elevacao Lateral",
      equipment: "Halteres",
      sets: { beginner: 3, intermediate: 3, advanced: 4 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
  ],
  barbell: [
    {
      name: "Supino Reto",
      equipment: "Barra",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 120, intermediate: 90, advanced: 60 },
    },
    {
      name: "Agachamento Livre",
      equipment: "Barra",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 120, intermediate: 90, advanced: 60 },
    },
    {
      name: "Remada Curvada",
      equipment: "Barra",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Desenvolvimento Militar",
      equipment: "Barra",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
  ],
  pullup_bar: [
    {
      name: "Barra Fixa",
      equipment: "Barra de Pullup",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "5", intermediate: "8", advanced: "12" },
      rest: { beginner: 120, intermediate: 90, advanced: 60 },
    },
    {
      name: "Chin-up",
      equipment: "Barra de Pullup",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "5", intermediate: "8", advanced: "10" },
      rest: { beginner: 120, intermediate: 90, advanced: 60 },
    },
    {
      name: "Pendurado na Barra (Abs)",
      equipment: "Barra de Pullup",
      sets: { beginner: 3, intermediate: 3, advanced: 4 },
      reps: { beginner: "8", intermediate: "12", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
  ],
  resistance_band: [
    {
      name: "Puxada com Elastico",
      equipment: "Elastico",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
    {
      name: "Rosca com Elastico",
      equipment: "Elastico",
      sets: { beginner: 3, intermediate: 3, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
    {
      name: "Agachamento com Elastico",
      equipment: "Elastico",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
    {
      name: "Abduo com Elastico",
      equipment: "Elastico",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
  ],
  bench: [
    {
      name: "Supino no Banco",
      equipment: "Banco",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Step-up no Banco",
      equipment: "Banco",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
    {
      name: "Triceps no Banco",
      equipment: "Banco",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "12", advanced: "15" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
  ],
  kettlebell: [
    {
      name: "Swing com Kettlebell",
      equipment: "Kettlebell",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "10", intermediate: "15", advanced: "20" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Goblet Squat",
      equipment: "Kettlebell",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "10", intermediate: "12", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Clean & Press",
      equipment: "Kettlebell",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "10", advanced: "12" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Turkish Get-up",
      equipment: "Kettlebell",
      sets: { beginner: 2, intermediate: 3, advanced: 4 },
      reps: { beginner: "3", intermediate: "5", advanced: "5" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
  ],
  mat: [
    {
      name: "Prancha",
      equipment: "Colchonete",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "20s", intermediate: "30s", advanced: "45s" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
    {
      name: "Abdominal",
      equipment: "Colchonete",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
    {
      name: "Flexao de Bracos",
      equipment: "Colchonete",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "8", intermediate: "12", advanced: "20" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Ponte de Gluteos",
      equipment: "Colchonete",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
  ],
  jump_rope: [
    {
      name: "Pular Corda (Basico)",
      equipment: "Corda",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "30s", intermediate: "45s", advanced: "60s" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
    {
      name: "Pular Corda (Duplo)",
      equipment: "Corda",
      sets: { beginner: 2, intermediate: 3, advanced: 4 },
      reps: { beginner: "20s", intermediate: "30s", advanced: "45s" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
  ],
  generic: [
    {
      name: "Burpees",
      equipment: "Corpo",
      sets: { beginner: 3, intermediate: 4, advanced: 5 },
      reps: { beginner: "5", intermediate: "10", advanced: "15" },
      rest: { beginner: 90, intermediate: 60, advanced: 45 },
    },
    {
      name: "Polichinelos",
      equipment: "Corpo",
      sets: { beginner: 3, intermediate: 3, advanced: 4 },
      reps: { beginner: "20", intermediate: "30", advanced: "40" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
    {
      name: "Agachamento Livre",
      equipment: "Corpo",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "12", intermediate: "15", advanced: "20" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
    {
      name: "Afundo",
      equipment: "Corpo",
      sets: { beginner: 3, intermediate: 4, advanced: 4 },
      reps: { beginner: "8", intermediate: "12", advanced: "15" },
      rest: { beginner: 60, intermediate: 45, advanced: 30 },
    },
  ],
};

const WORKOUT_NAMES = [
  "Treino Forca Total",
  "Treino Resistencia",
  "Treino Explosao",
  "Treino Funcional",
  "Treino Hipertrofia",
  "Treino Full Body",
  "Treino Core & Power",
  "Treino Circuito",
];

function detectEquipmentType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("halter") || lower.includes("dumbbell")) return "dumbbell";
  if (lower.includes("barra") && !lower.includes("pullup"))  return "barbell";
  if (lower.includes("pullup") || lower.includes("barra fixa")) return "pullup_bar";
  if (lower.includes("elastic") || lower.includes("band") || lower.includes("faixa")) return "resistance_band";
  if (lower.includes("banco") || lower.includes("bench")) return "bench";
  if (lower.includes("kettle")) return "kettlebell";
  if (lower.includes("colchonete") || lower.includes("mat") || lower.includes("tapete")) return "mat";
  if (lower.includes("corda") || lower.includes("rope")) return "jump_rope";
  return "generic";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateWorkout(
  equipment: Equipment[],
  level: Level,
): Workout {
  const exercisePool: ExerciseTemplate[] = [];
  const detectedTypes = new Set<string>();

  for (const eq of equipment) {
    const type = detectEquipmentType(eq.name);
    if (!detectedTypes.has(type)) {
      detectedTypes.add(type);
      const templates = EQUIPMENT_EXERCISES[type] || EQUIPMENT_EXERCISES.generic;
      exercisePool.push(...templates);
    }
  }

  if (exercisePool.length === 0) {
    exercisePool.push(...EQUIPMENT_EXERCISES.generic);
  }

  const shuffled = shuffle(exercisePool);
  const maxExercises = level === "beginner" ? 5 : level === "intermediate" ? 6 : 8;
  const selected = shuffled.slice(0, Math.min(maxExercises, shuffled.length));

  const exercises: Exercise[] = selected.map((t) => ({
    name: t.name,
    sets: t.sets[level],
    reps: t.reps[level],
    equipment: t.equipment,
    restSeconds: t.rest[level],
  }));

  const totalMinutes = exercises.reduce((sum, e) => {
    const repTime = e.reps.includes("s") ? parseInt(e.reps) : parseInt(e.reps) * 3;
    return sum + e.sets * (repTime + e.restSeconds);
  }, 0);

  const durationMin = Math.round(totalMinutes / 60);

  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  return {
    id,
    name: WORKOUT_NAMES[Math.floor(Math.random() * WORKOUT_NAMES.length)],
    exercises,
    level,
    createdAt: Date.now(),
    duration: `${durationMin} min`,
  };
}

export const EQUIPMENT_OPTIONS = [
  { key: "dumbbell", label: "Halteres", icon: "fitness" as const },
  { key: "barbell", label: "Barra", icon: "barbell" as const },
  { key: "pullup_bar", label: "Barra Fixa", icon: "body" as const },
  { key: "resistance_band", label: "Elastico", icon: "pulse" as const },
  { key: "bench", label: "Banco", icon: "bed" as const },
  { key: "kettlebell", label: "Kettlebell", icon: "bowling-ball" as const },
  { key: "mat", label: "Colchonete", icon: "layers" as const },
  { key: "jump_rope", label: "Corda", icon: "flash" as const },
] as const;
