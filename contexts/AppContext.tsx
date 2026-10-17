import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
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
  loginWithGoogle: (idToken: string) => Promise<UserData>;
  logout: () => Promise<void>;
  updateAvatar: (avatar: string | null) => Promise<void>;
  setUserLevel: (level: Level) => Promise<void>;
  addUserEquipment: (item: Equipment) => Promise<void>;
  removeUserEquipment: (id: string) => Promise<void>;
  saveUserWorkout: (workout: Workout) => Promise<Workout>;
  updateUserWorkout: (workout: Workout) => Promise<void>;
  addWorkoutHistory: (entry: WorkoutHistory) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function normalizeWorkouts(items: any[]): Workout[] {
  return (items || []).map((w) => ({
    ...w,
    createdAt: typeof w.createdAt === "number" ? w.createdAt : new Date(w.createdAt).getTime() || 0,
  }));
}

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
          const [remoteUser, eq, wk, hist] = await Promise.all([
            apiRequest("GET", `/api/user/${userData.id}`).then(r => r.json()),
            apiRequest("GET", `/api/user/${userData.id}/equipment`).then(r => r.json()),
            apiRequest("GET", `/api/user/${userData.id}/workouts`).then(r => r.json()),
            apiRequest("GET", `/api/user/${userData.id}/history`).then(r => r.json()),
          ]);
          // Mantem nome, nivel e foto em dia com o servidor
          const freshUser: UserData = { ...userData, ...remoteUser };
          await storage.setUser(freshUser);
          setUser(freshUser);
          setEquipmentState(eq);
          setWorkouts(normalizeWorkouts(wk));
          setHistory(hist);
        } catch (e) {
          console.error("Failed to load remote data:", e);
          const [eq, wk, hist] = await Promise.all([
            storage.getEquipment(),
            storage.getWorkouts(),
            storage.getHistory(),
          ]);
          setEquipmentState(eq);
          setWorkouts(normalizeWorkouts(wk));
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
        setWorkouts(normalizeWorkouts(wk));
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

  const loginWithGoogle = useCallback(async (idToken: string): Promise<UserData> => {
    const res = await apiRequest("POST", "/api/auth/google", { idToken });
    const userData: UserData = await res.json();
    await hydrateUserData(userData);
    return userData;
  }, [hydrateUserData]);

  const logout = useCallback(async () => {
    // Desconecta do Google para o seletor de contas aparecer no proximo login
    await GoogleSignin.signOut().catch(() => {});
    await storage.clearUserData();
    setUser(null);
    setLevel(null);
    setEquipmentState([]);
    setWorkouts([]);
    setHistory([]);
  }, []);

  const updateAvatar = useCallback(async (avatar: string | null) => {
    if (!user?.id) return;
    await apiRequest("PUT", `/api/user/${user.id}/avatar`, { avatar });
    const updated = { ...user, avatar };
    await storage.setUser(updated);
    setUser(updated);
  }, [user]);

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

  const putWorkoutInState = useCallback((workout: Workout, replaceId?: string) => {
    setWorkouts((prev) => {
      const matchId = replaceId ?? workout.id;
      const idx = prev.findIndex((w) => w.id === matchId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = workout;
        return copy;
      }
      return [...prev, workout];
    });
  }, []);

  // Cria o treino no servidor e passa a usar o UUID gerado pelo banco no lugar do id local
  const createOnServer = useCallback(async (workout: Workout): Promise<Workout> => {
    if (!user?.id) return workout;
    const res = await apiRequest("POST", `/api/user/${user.id}/workouts`, workout);
    const saved = await res.json();
    if (saved?.id && saved.id !== workout.id) {
      const withServerId = { ...workout, id: saved.id };
      await storage.replaceWorkoutId(workout.id, withServerId);
      putWorkoutInState(withServerId, workout.id);
      return withServerId;
    }
    return workout;
  }, [user, putWorkoutInState]);

  // Devolve o treino com o id final (do servidor, quando disponivel) para as telas navegarem
  const saveUserWorkout = useCallback(async (workout: Workout): Promise<Workout> => {
    await storage.saveWorkout(workout);
    putWorkoutInState(workout);
    try {
      return await createOnServer(workout);
    } catch (e) {
      console.error("Failed to save workout on server:", e);
      return workout;
    }
  }, [putWorkoutInState, createOnServer]);

  const updateUserWorkout = useCallback(async (workout: Workout) => {
    await storage.saveWorkout(workout);
    putWorkoutInState(workout);
    if (!user?.id) return;
    try {
      const res = await apiRequest("PUT", `/api/user/${user.id}/workouts/${workout.id}`, {
        exercises: workout.exercises,
        duration: workout.duration,
      });
      await res.json();
    } catch (e: any) {
      // Treino ainda com id local (servidor indisponivel quando foi criado): cria agora
      if (String(e?.message || "").startsWith("404")) {
        await createOnServer(workout).catch((err) =>
          console.error("Failed to create workout on server:", err),
        );
      } else {
        console.error("Failed to update workout on server:", e);
      }
    }
  }, [user, putWorkoutInState, createOnServer]);

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
      updateAvatar,
      setUserLevel,
      addUserEquipment,
      removeUserEquipment,
      saveUserWorkout,
      updateUserWorkout,
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
      updateAvatar,
      setUserLevel,
      addUserEquipment,
      removeUserEquipment,
      saveUserWorkout,
      updateUserWorkout,
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
