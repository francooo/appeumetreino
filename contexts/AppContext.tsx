import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import * as storage from "@/lib/storage";
import type {
  UserData,
  Level,
  Equipment,
  Workout,
  WorkoutHistory,
} from "@/lib/storage";

interface AppContextValue {
  isLoading: boolean;
  isOnboarded: boolean;
  user: UserData | null;
  level: Level | null;
  equipment: Equipment[];
  workouts: Workout[];
  history: WorkoutHistory[];
  setOnboarded: () => Promise<void>;
  login: (user: UserData) => Promise<void>;
  logout: () => Promise<void>;
  setUserLevel: (level: Level) => Promise<void>;
  addUserEquipment: (item: Equipment) => Promise<void>;
  removeUserEquipment: (id: string) => Promise<void>;
  saveUserWorkout: (workout: Workout) => Promise<void>;
  addWorkoutHistory: (entry: WorkoutHistory) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [equipment, setEquipmentState] = useState<Equipment[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [history, setHistory] = useState<WorkoutHistory[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [onboarded, userData, userLevel, eq, wk, hist] = await Promise.all([
        storage.getOnboarded(),
        storage.getUser(),
        storage.getLevel(),
        storage.getEquipment(),
        storage.getWorkouts(),
        storage.getHistory(),
      ]);
      setIsOnboardedState(onboarded);
      setUser(userData);
      setLevel(userLevel);
      setEquipmentState(eq);
      setWorkouts(wk);
      setHistory(hist);
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setOnboarded = useCallback(async () => {
    await storage.setOnboarded(true);
    setIsOnboardedState(true);
  }, []);

  const login = useCallback(async (userData: UserData) => {
    await storage.setUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await storage.clearAllData();
    setUser(null);
    setLevel(null);
    setEquipmentState([]);
    setWorkouts([]);
    setHistory([]);
    setIsOnboardedState(false);
  }, []);

  const setUserLevel = useCallback(async (l: Level) => {
    await storage.setLevel(l);
    setLevel(l);
  }, []);

  const addUserEquipment = useCallback(async (item: Equipment) => {
    await storage.addEquipment(item);
    setEquipmentState((prev) => [...prev, item]);
  }, []);

  const removeUserEquipment = useCallback(async (id: string) => {
    await storage.removeEquipment(id);
    setEquipmentState((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const saveUserWorkout = useCallback(async (workout: Workout) => {
    await storage.saveWorkout(workout);
    setWorkouts((prev) => {
      const idx = prev.findIndex((w) => w.id === workout.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = workout;
        return copy;
      }
      return [...prev, workout];
    });
  }, []);

  const addWorkoutHistory = useCallback(async (entry: WorkoutHistory) => {
    await storage.addHistory(entry);
    setHistory((prev) => [entry, ...prev]);
  }, []);

  const value = useMemo(
    () => ({
      isLoading,
      isOnboarded,
      user,
      level,
      equipment,
      workouts,
      history,
      setOnboarded,
      login,
      logout,
      setUserLevel,
      addUserEquipment,
      removeUserEquipment,
      saveUserWorkout,
      addWorkoutHistory,
      refreshData: loadData,
    }),
    [
      isLoading,
      isOnboarded,
      user,
      level,
      equipment,
      workouts,
      history,
      setOnboarded,
      login,
      logout,
      setUserLevel,
      addUserEquipment,
      removeUserEquipment,
      saveUserWorkout,
      addWorkoutHistory,
      loadData,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
