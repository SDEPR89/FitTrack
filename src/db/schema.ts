import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  numeric,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

// 1. Exercises Table
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
});

// 2. Workout Sets Table
export const workoutSets = pgTable("workout_sets", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id),
  setNumber: integer("set_number").notNull(),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
  reps: integer("reps"),
  ischecked: boolean("is_checked").default(false),
});

// 3. Define Drizzle Relations
export const exercisesRelations = relations(exercises, ({ many }) => ({
  sets: many(workoutSets), // 1 Exercise has MANY Sets
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [workoutSets.exerciseId],
    references: [exercises.id],
  }), // 1 Set belongs to ONE Exercise
}));
