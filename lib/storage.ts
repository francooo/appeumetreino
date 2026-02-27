import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  onboarded: "eu_me_treino_onboarded",
  user: "eu_me_treino_user",
  level: "eu_me_treino_level",
  equipment: "eu_me_treino_equipment",
  workouts: "eu_me_treino_workouts",
  history: "eu_me_treino_history",
};

export interface UserData {
  id: string;
  name: string;
  email: string;
  level?: string | null;
}

export type Level = "beginner" | "intermediate" | "advanced";

export interface Equipment {
  id: string;
  name: string;
  imageUri: string;
  addedAt: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  equipment: string;
  restSeconds: number;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  level: Level;
  createdAt: number;
  duration: string;
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  workoutName: string;
  completedAt: number;
  duration: number;
}

export async function getOnboarded(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.onboarded);
  return val === "true";
}

export async function setOnboarded(val: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboarded, val.toString());
}

export async function getUser(): Promise<UserData | null> {
  const val = await AsyncStorage.getItem(KEYS.user);
  return val ? JSON.parse(val) : null;
}

export async function setUser(user: UserData): Promise<void> {
  await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.user);
}

export async function getLevel(): Promise<Level | null> {
  const val = await AsyncStorage.getItem(KEYS.level);
  return val as Level | null;
}

export async function setLevel(level: Level): Promise<void> {
  await AsyncStorage.setItem(KEYS.level, level);
}

export async function getEquipment(): Promise<Equipment[]> {
  const val = await AsyncStorage.getItem(KEYS.equipment);
  return val ? JSON.parse(val) : [];
}

export async function setEquipment(items: Equipment[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.equipment, JSON.stringify(items));
}

export async function addEquipment(item: Equipment): Promise<void> {
  const items = await getEquipment();
  items.push(item);
  await setEquipment(items);
}

export async function removeEquipment(id: string): Promise<void> {
  const items = await getEquipment();
  await setEquipment(items.filter((i) => i.id !== id));
}

export async function getWorkouts(): Promise<Workout[]> {
  const val = await AsyncStorage.getItem(KEYS.workouts);
  return val ? JSON.parse(val) : [];
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const items = await getWorkouts();
  const idx = items.findIndex((w) => w.id === workout.id);
  if (idx >= 0) {
    items[idx] = workout;
  } else {
    items.push(workout);
  }
  await AsyncStorage.setItem(KEYS.workouts, JSON.stringify(items));
}

export async function getHistory(): Promise<WorkoutHistory[]> {
  const val = await AsyncStorage.getItem(KEYS.history);
  return val ? JSON.parse(val) : [];
}

export async function addHistory(entry: WorkoutHistory): Promise<void> {
  const items = await getHistory();
  items.unshift(entry);
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(items));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}
