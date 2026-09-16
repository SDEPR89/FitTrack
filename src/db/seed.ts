import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log("Truncating tables...");
  await pool.query(
    `TRUNCATE TABLE workout_sets, program_exercises, programs, program_types, exercises RESTART IDENTITY CASCADE;`,
  );

  console.log("Seeding exercises...");
  const insertedExercises = await db
    .insert(schema.exercises)
    .values([
      { name: "BENCH PRESS", category: "CHEST" },
      { name: "INCLINE DUMBBELL PRESS", category: "CHEST" },
      { name: "PULL UP", category: "BACK" },
      { name: "BARBELL ROW", category: "BACK" },
      { name: "OVERHEAD PRESS", category: "SHOULDER" },
      { name: "LATERAL RAISE", category: "SHOULDER" },
      { name: "SQUAT", category: "LEG" },
      { name: "ROMANIAN DEADLIFT", category: "HAMSTRING" },
      { name: "PLANK", category: "ABS" },
      { name: "DIP", category: "CHEST" },
    ])
    .returning();

  // Small helper so we don't repeat find()+undefined-checks five times
  function findExercise(name: string) {
    const ex = insertedExercises.find((e) => e.name === name);
    if (!ex) throw new Error(`Exercise not found after seeding: ${name}`);
    return ex;
  }

  console.log("Seeding program types...");
  const insertedProgramTypes = await db
    .insert(schema.programTypes)
    .values([
      { name: "UPPER" },
      { name: "LOWER" },
      { name: "PUSH" },
      { name: "PULL" },
    ])
    .returning();

  function findProgramType(name: string) {
    const pt = insertedProgramTypes.find((t) => t.name === name);
    if (!pt) throw new Error(`Program type not found after seeding: ${name}`);
    return pt;
  }

  console.log("Seeding programs...");
  const insertedPrograms = await db
    .insert(schema.programs)
    .values([
      { name: "Upper Body A", programTypeId: findProgramType("UPPER").id },
      { name: "Upper Body B", programTypeId: findProgramType("UPPER").id },
      { name: "Lower Body", programTypeId: findProgramType("LOWER").id },
    ])
    .returning();

  function findProgram(name: string) {
    const p = insertedPrograms.find((pr) => pr.name === name);
    if (!p) throw new Error(`Program not found after seeding: ${name}`);
    return p;
  }

  console.log("Seeding program_exercises (linking programs to exercises)...");
  await db.insert(schema.programExercises).values([
    // Upper Body A
    {
      programId: findProgram("Upper Body A").id,
      exerciseId: findExercise("BENCH PRESS").id,
    },
    {
      programId: findProgram("Upper Body A").id,
      exerciseId: findExercise("BARBELL ROW").id,
    },
    {
      programId: findProgram("Upper Body A").id,
      exerciseId: findExercise("OVERHEAD PRESS").id,
    },

    // Upper Body B
    {
      programId: findProgram("Upper Body B").id,
      exerciseId: findExercise("INCLINE DUMBBELL PRESS").id,
    },
    {
      programId: findProgram("Upper Body B").id,
      exerciseId: findExercise("PULL UP").id,
    },
    {
      programId: findProgram("Upper Body B").id,
      exerciseId: findExercise("LATERAL RAISE").id,
    },

    // Lower Body
    {
      programId: findProgram("Lower Body").id,
      exerciseId: findExercise("SQUAT").id,
    },
    {
      programId: findProgram("Lower Body").id,
      exerciseId: findExercise("ROMANIAN DEADLIFT").id,
    },
  ]);

  console.log(
    "Seeding a few workout_sets for Bench Press (so PATCH/GET have real data)...",
  );
  await db.insert(schema.workoutSets).values([
    {
      exerciseId: findExercise("BENCH PRESS").id,
      setNumber: 1,
      weightKg: "60",
      reps: 8,
      isChecked: true,
    },
    {
      exerciseId: findExercise("BENCH PRESS").id,
      setNumber: 2,
      weightKg: "65",
      reps: 7,
      isChecked: true,
    },
    {
      exerciseId: findExercise("BENCH PRESS").id,
      setNumber: 3,
      weightKg: "70",
      reps: 6,
      isChecked: false,
    },
  ]);

  console.log("Seeding complete.");
  await pool.end();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
