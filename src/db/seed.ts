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

  // Optional: Clear existing data to start fresh
  // await db.delete(schema.users);

  // Insert mock data
  await db.insert(schema.exercises).values([
    { id: 1, name: "BENCH PRESS", category: '"UPPER BODY' },
    { id: 2, name: "DIP", category: '"UPPER BODY' },
    { id: 3, name: "PULL UP", category: '"UPPER BODY' },
    { id: 4, name: "SQUAT", category: '"LOWER BODY' },
    { id: 5, name: "PISTON SQUAT", category: '"SKILL' },
  ]);

  console.log("Seeding complete.");
  await pool.end();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
