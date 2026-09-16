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

  console.log("Seeding program types...");

  await db
    .insert(schema.programTypes)
    .values([
      { name: "FULL BODY" },
      { name: "UPPER BODY" },
      { name: "LOWER BODY" },
      { name: "PUSH" },
      { name: "PULL" },
      { name: "LEG" },
      { name: "CORE BODY" },
      { name: "CARDIO" },
      { name: "SKILL" },
      { name: "STRETCHING" },
    ])
    .returning();
  console.log("Seeding complete.");
  await pool.end();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
