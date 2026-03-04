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
import { apiRequest } from "@/lib/query-client";
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
  visionResult: any | null;
  setVisionResult: (result: any | null) => void;
  setOnboarded: () => Promise<void>;
  login: (user: UserData) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<UserData>;
  loginWithCredentials: (email: string, password: string) => Promise<UserData>;
  loginWithGoogle: (name: string, email: string, googleId: string) => Promise<UserData>;
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
  const [visionResult, setVisionResult] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [onboarded, userData, userLevel] = await Promise.all([
        storage.getOnboarded(),
        storage.getUser(),
        storage.getLevel(),
      ]);
      setIsOnboardedState(onboarded);
      setUser(userData);
      setLevel(userLevel);

      if (userData?.id) {
        try {
          const [eq, wk, hist] = await Promise.all([
            apiRequest("GET", `/api/user/${userData.id}/equipment`).then(r => r.json()),
            apiRequest("GET", `/api/user/${userData.id}/workouts`).then(r => r.json()),
            apiRequest("GET", `/api/user/${userData.id}/history`).then(r => r.json()),
          ]);
          setEquipmentState(eq);
          setWorkouts(wk);
          setHistory(hist);
        } catch (e) {
          console.error("Failed to load remote data:", e);
          const [eq, wk, hist] = await Promise.all([
            storage.getEquipment(),
            storage.getWorkouts(),
            storage.getHistory(),
          ]);
          setEquipmentState(eq);
          setWorkouts(wk);
          setHistory(hist);
        }
      }
    } catch (e) {
      console.error("Failed to load data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hydrateUserData = useCallback(async (userData: UserData) => {
    await storage.setUser(userData);
    if (userData.level) {
      await storage.setLevel(userData.level as Level);
      setLevel(userData.level as Level);
    }
    setUser(userData);
    if (userData.id) {
      try {
        const [eq, wk, hist] = await Promise.all([
          apiRequest("GET", `/api/user/${userData.id}/equipment`).then(r => r.json()),
          apiRequest("GET", `/api/user/${userData.id}/workouts`).then(r => r.json()),
          apiRequest("GET", `/api/user/${userData.id}/history`).then(r => r.json()),
        ]);
        setEquipmentState(eq);
        setWorkouts(wk);
        setHistory(hist);
      } catch (e) {
        console.error("Failed to hydrate user data:", e);
      }
    }
  }, []);

  const setOnboarded = useCallback(async () => {
    await storage.setOnboarded(true);
    setIsOnboardedState(true);
  }, []);

  const login = useCallback(async (userData: UserData) => {
    await hydrateUserData(userData);
  }, [hydrateUserData]);

  const register = useCallback(async (name: string, email: string, password: string): Promise<UserData> => {
    const res = await apiRequest("POST", "/api/auth/register", { name, email, password });
    const userData: UserData = await res.json();
    await hydrateUserData(userData);
    return userData;
  }, [hydrateUserData]);

  const loginWithCredentials = useCallback(async (email: string, password: string): Promise<UserData> => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const userData: UserData = await res.json();
    await hydrateUserData(userData);
    return userData;
  }, [hydrateUserData]);

  const loginWithGoogle = useCallback(async (name: string, email: string, googleId: string): Promise<UserData> => {
    const res = await apiRequest("POST", "/api/auth/google", { name, email, googleId });
    const userData: UserData = await res.json();
    await hydrateUserData(userData);
    return userData;
  }, [hydrateUserData]);

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
    if (user?.id) {
      try {
        await apiRequest("PUT", `/api/user/${user.id}/level`, { level: l });
      } catch (e) {
        console.error("Failed to update level on server:", e);
      }
    }
  }, [user]);

  const addUserEquipment = useCallback(async (item: Equipment) => {
    await storage.addEquipment(item);
    setEquipmentState((prev) => [...prev, item]);
    if (user?.id) {
      try {
        await apiRequest("POST", `/api/user/${user.id}/equipment`, {
          name: item.name,
          imageUri: item.imageUri,
        });
      } catch (e) {
        console.error("Failed to add equipment on server:", e);
      }
    }
  }, [user]);

  const removeUserEquipment = useCallback(async (id: string) => {
    await storage.removeEquipment(id);
    setEquipmentState((prev) => prev.filter((i) => i.id !== id));
    if (user?.id) {
      try {
        await apiRequest("DELETE", `/api/user/${user.id}/equipment/${id}`);
      } catch (e) {
        console.error("Failed to remove equipment on server:", e);
      }
    }
  }, [user]);

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
    if (user?.id) {
      try {
        await apiRequest("POST", `/api/user/${user.id}/workouts`, workout);
      } catch (e) {
        console.error("Failed to save workout on server:", e);
      }
    }
  }, [user]);

  const addWorkoutHistory = useCallback(async (entry: WorkoutHistory) => {
    await storage.addHistory(entry);
    setHistory((prev) => [entry, ...prev]);
    if (user?.id) {
      try {
        await apiRequest("POST", `/api/user/${user.id}/history`, entry);
      } catch (e) {
        console.error("Failed to add history on server:", e);
      }
    }
  }, [user]);

  const value = useMemo(
    () => ({
      isLoading,
      isOnboarded,
      user,
      level,
      equipment,
      workouts,
      history,
      visionResult,
      setVisionResult,
      setOnboarded,
      login,
      register,
      loginWithCredentials,
      loginWithGoogle,
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
      visionResult,
      setOnboarded,
      login,
      register,
      loginWithCredentials,
      loginWithGoogle,
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
