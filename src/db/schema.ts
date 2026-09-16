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

export const programTypes = pgTable("program_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  programTypeId: integer("program_type_id")
    .notNull()
    .references(() => programTypes.id),
});

export const programExercises = pgTable("program_exercises", {
  id: serial("id").primaryKey(),
  programId: integer("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "cascade" }),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercises.id),
});

export const exercisesRelations = relations(exercises, ({ many }) => ({
  sets: many(workoutSets),
  programExercises: many(programExercises),
}));

export const workoutSetsRelations = relations(workoutSets, ({ one }) => ({
  exercise: one(exercises, {
    fields: [workoutSets.exerciseId],
    references: [exercises.id],
  }),
}));

export const programTypeRelations = relations(programTypes, ({ many }) => ({
  programs: many(programs),
}));

export const programRelations = relations(programs, ({ one, many }) => ({
  programType: one(programTypes, {
    fields: [programs.programTypeId],
    references: [programTypes.id],
  }),
  programExercises: many(programExercises),
}));

export const programExerciseRelations = relations(
  programExercises,
  ({ one }) => ({
    program: one(programs, {
      fields: [programExercises.programId],
      references: [programs.id],
    }),
    exercise: one(exercises, {
      fields: [programExercises.exerciseId],
      references: [exercises.id],
    }),
  }),
);
