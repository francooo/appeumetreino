import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  equipment,
  workouts,
  workoutHistory,
  type User,
  type InsertUser,
  type Equipment,
  type Workout,
  type WorkoutHistory,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLevel(userId: string, level: string): Promise<void>;
  getEquipmentByUser(userId: string): Promise<Equipment[]>;
  addEquipment(userId: string, name: string, imageUri?: string): Promise<Equipment>;
  removeEquipment(id: string, userId: string): Promise<void>;
  getWorkoutsByUser(userId: string): Promise<Workout[]>;
  saveWorkout(userId: string, workout: Omit<Workout, "userId">): Promise<Workout>;
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
