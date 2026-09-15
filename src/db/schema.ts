import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  integer,
  numeric,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
});

export const workoutSets = pgTable("workout_sets", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id),
  setNumber: integer("set_number"),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
  reps: integer("reps"),
  isChecked: boolean("is_checked").default(false),
});

export const exercisesRelations = relations(exercises, ({ many }) => ({
  sets: many(workoutSets),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [workoutSets.exerciseId],
    references: [exercises.id],
  }),
}));
