import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  jsonb,
  real,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  googleId: text("google_id").unique(),
  level: text("level"),
  // Foto de perfil como data URI JPEG pequena (reduzida no app antes do envio)
  avatar: text("avatar"),
  calorieGoal: integer("calorie_goal").default(2000),
  createdAt: timestamp("created_at").defaultNow(),
});

export const equipment = pgTable("equipment", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  imageUri: text("image_uri").default(""),
  addedAt: timestamp("added_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  exercises: jsonb("exercises").notNull(),
  level: text("level").notNull(),
  duration: text("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutHistory = pgTable("workout_history", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  workoutId: text("workout_id").notNull(),
  workoutName: text("workout_name").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  duration: integer("duration").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  googleId: true,
});

// Refeicoes do medidor de calorias. `day` e a data local do aparelho (YYYY-MM-DD)
export const meals = pgTable("meals", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  day: text("day").notNull(),
  eatenAt: timestamp("eaten_at").notNull(),
  mealType: text("meal_type").notNull(),
  name: text("name").notNull(),
  kcal: integer("kcal").notNull(),
  photo: text("photo"),
  items: jsonb("items"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Peso corporal: um registro por usuario por dia
export const weights = pgTable(
  "weights",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    day: text("day").notNull(),
    kg: real("kg").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("weights_user_day_idx").on(t.userId, t.day)],
);

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Equipment = typeof equipment.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutHistory = typeof workoutHistory.$inferSelect;
export type Meal = typeof meals.$inferSelect;
export type WeightEntry = typeof weights.$inferSelect;
