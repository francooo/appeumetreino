import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  equipment,
  workouts,
  workoutHistory,
  meals,
  weights,
  type Meal,
  type WeightEntry,
  type User,
  type InsertUser,
  type Equipment,
  type Workout,
  type WorkoutHistory,
} from "../shared/schema";

export type MealInput = Pick<Meal, "day" | "eatenAt" | "mealType" | "name" | "kcal" | "photo" | "items">;

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLevel(userId: string, level: string): Promise<void>;
  linkGoogleId(userId: string, googleId: string): Promise<User>;
  updateUserAvatar(userId: string, avatar: string | null): Promise<void>;
  updateUserName(userId: string, name: string): Promise<User | undefined>;
  updateCalorieGoal(userId: string, goal: number): Promise<void>;
  getMealsByDay(userId: string, day: string): Promise<Meal[]>;
  addMeal(userId: string, meal: MealInput): Promise<Meal>;
  updateMeal(userId: string, mealId: string, meal: MealInput): Promise<Meal | undefined>;
  deleteMeal(userId: string, mealId: string): Promise<boolean>;
  getWeights(userId: string, from: string, to: string): Promise<WeightEntry[]>;
  getLatestWeight(userId: string): Promise<WeightEntry | undefined>;
  saveWeight(userId: string, day: string, kg: number): Promise<WeightEntry>;
  getEquipmentByUser(userId: string): Promise<Equipment[]>;
  addEquipment(userId: string, name: string, imageUri?: string): Promise<Equipment>;
  removeEquipment(id: string, userId: string): Promise<void>;
  getWorkoutsByUser(userId: string): Promise<Workout[]>;
  saveWorkout(userId: string, workout: Omit<Workout, "userId">): Promise<Workout>;
  updateWorkout(
    userId: string,
    workoutId: string,
    data: Pick<Workout, "exercises" | "duration">,
  ): Promise<Workout | undefined>;
  getHistoryByUser(userId: string): Promise<WorkoutHistory[]>;
  addHistory(userId: string, entry: Omit<WorkoutHistory, "userId">): Promise<WorkoutHistory>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserLevel(userId: string, level: string): Promise<void> {
    await db.update(users).set({ level }).where(eq(users.id, userId));
  }

  async linkGoogleId(userId: string, googleId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ googleId })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserAvatar(userId: string, avatar: string | null): Promise<void> {
    await db.update(users).set({ avatar }).where(eq(users.id, userId));
  }

  async updateUserName(userId: string, name: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ name }).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateCalorieGoal(userId: string, goal: number): Promise<void> {
    await db.update(users).set({ calorieGoal: goal }).where(eq(users.id, userId));
  }

  async getMealsByDay(userId: string, day: string): Promise<Meal[]> {
    return db
      .select()
      .from(meals)
      .where(and(eq(meals.userId, userId), eq(meals.day, day)))
      .orderBy(asc(meals.eatenAt));
  }

  async addMeal(userId: string, meal: MealInput): Promise<Meal> {
    const [saved] = await db.insert(meals).values({ ...meal, userId }).returning();
    return saved;
  }

  async updateMeal(userId: string, mealId: string, meal: MealInput): Promise<Meal | undefined> {
    const [saved] = await db
      .update(meals)
      .set(meal)
      .where(and(eq(meals.id, mealId), eq(meals.userId, userId)))
      .returning();
    return saved;
  }

  async deleteMeal(userId: string, mealId: string): Promise<boolean> {
    const deleted = await db
      .delete(meals)
      .where(and(eq(meals.id, mealId), eq(meals.userId, userId)))
      .returning({ id: meals.id });
    return deleted.length > 0;
  }

  async getWeights(userId: string, from: string, to: string): Promise<WeightEntry[]> {
    return db
      .select()
      .from(weights)
      .where(and(eq(weights.userId, userId), gte(weights.day, from), lte(weights.day, to)))
      .orderBy(asc(weights.day));
  }

  async getLatestWeight(userId: string): Promise<WeightEntry | undefined> {
    const [latest] = await db
      .select()
      .from(weights)
      .where(eq(weights.userId, userId))
      .orderBy(desc(weights.day))
      .limit(1);
    return latest;
  }

  async saveWeight(userId: string, day: string, kg: number): Promise<WeightEntry> {
    // Um registro por dia: registrar de novo no mesmo dia substitui o valor
    const [saved] = await db
      .insert(weights)
      .values({ userId, day, kg })
      .onConflictDoUpdate({ target: [weights.userId, weights.day], set: { kg } })
      .returning();
    return saved;
  }

  async getEquipmentByUser(userId: string): Promise<Equipment[]> {
    return db
      .select()
      .from(equipment)
      .where(eq(equipment.userId, userId));
  }

  async addEquipment(
    userId: string,
    name: string,
    imageUri?: string,
  ): Promise<Equipment> {
    const [item] = await db
      .insert(equipment)
      .values({ userId, name, imageUri: imageUri || "" })
      .returning();
    return item;
  }

  async removeEquipment(id: string, userId: string): Promise<void> {
    const { and } = await import("drizzle-orm");
    await db
      .delete(equipment)
      .where(and(eq(equipment.id, id), eq(equipment.userId, userId)));
  }

  async getWorkoutsByUser(userId: string): Promise<Workout[]> {
    return db
      .select()
      .from(workouts)
      .where(eq(workouts.userId, userId));
  }

  async saveWorkout(
    userId: string,
    workout: Omit<Workout, "userId">,
  ): Promise<Workout> {
    const [saved] = await db
      .insert(workouts)
      .values({ ...workout, userId })
      .returning();
    return saved;
  }

  async updateWorkout(
    userId: string,
    workoutId: string,
    data: Pick<Workout, "exercises" | "duration">,
  ): Promise<Workout | undefined> {
    const [updated] = await db
      .update(workouts)
      .set(data)
      .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
      .returning();
    return updated;
  }

  async getHistoryByUser(userId: string): Promise<WorkoutHistory[]> {
    return db
      .select()
      .from(workoutHistory)
      .where(eq(workoutHistory.userId, userId));
  }

  async addHistory(
    userId: string,
    entry: Omit<WorkoutHistory, "userId">,
  ): Promise<WorkoutHistory> {
    const [saved] = await db
      .insert(workoutHistory)
      .values({ ...entry, userId })
      .returning();
    return saved;
  }
}

export const storage = new DatabaseStorage();
