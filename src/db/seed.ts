import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log("Seeding database...");

  await db.delete(schema.workoutSets);
  await db.delete(schema.exercises);

  const insertedExercises = await db
    .insert(schema.exercises)
    .values([
      { name: "BENCH PRESS", category: "UPPER BODY" },
      { name: "DIP", category: "UPPER BODY" },
      { name: "PULL UP", category: "UPPER BODY" },
      { name: "SQUAT", category: "LOWER BODY" },
      { name: "PISTON SQUAT", category: "SKILL" },
    ])
    .returning();

  const benchPress = insertedExercises.find((e) => e.name === "BENCH PRESS");

  if (!benchPress) {
    throw new Error("Bench Press exercise not found after seeding");
  }

  await db.insert(schema.workoutSets).values([
    { exerciseId: benchPress.id, setNumber: 1, weightKg: "60", reps: 8 },
    { exerciseId: benchPress.id, setNumber: 2, weightKg: "65", reps: 7 },
    { exerciseId: benchPress.id, setNumber: 3, weightKg: "70", reps: 6 },
  ]);

  console.log("Seeding complete.");
  await pool.end();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
