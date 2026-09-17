import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const muscleMappings: Record<string, string[]> = {
  "BENCH PRESS": ["CHEST", "ANTERIOR DELTOID", "TRICEPS"],
  "PULL UP": ["BACK", "LATS", "BICEPS"],
  "DIP": ["CHEST", "ANTERIOR DELTOID", "TRICEPS"],
  "SINGLE ARM DB ROW": ["LATS", "BACK", "BICEPS"],
  "DB LATERAL RAISE": ["LATERAL DELTOID", "SHOULDERS"],
  "HANDSTAND": ["SKILL", "SHOULDERS", "CORE"],
  "L SIT": ["SKILL", "ABS", "CORE"],
  "BULGARIAN SPLIT SQUAT": ["QUADRICEPS", "GLUTES"],
  "PISTOL SQUAT": ["SKILL", "QUADRICEPS", "GLUTES"],
  "DB SQUAT JUMP": ["QUADRICEPS", "GLUTES", "CARDIO"],
  "CALF RAISE": ["CALVES", "TRICEPS SURAE"],
  "DRAGON FLAG": ["SKILL", "ABS", "CORE"],
  "MUSCLE UP": ["SKILL", "CHEST", "BACK", "TRICEPS"],
  "CHIN UP": ["BICEPS", "LATS", "BACK"],
  "PIKE PUSH UP": ["ANTERIOR DELTOID", "SHOULDERS", "TRICEPS"],
  "ELBOW LEVER": ["SKILL", "CORE"],
  "SINGLE LEG RDL": ["HAMSTRINGS", "GLUTES"],
  "HIP THRUST": ["GLUTES", "HAMSTRINGS"],
  "HANGING LEG RAISE": ["ABS", "CORE"],
};

async function main() {
  console.log("Migrating column exercises.category to text[]...");
  try {
    const colInfo = await pool.query(
      `SELECT data_type FROM information_schema.columns WHERE table_name = 'exercises' AND column_name = 'category';`
    );

    if (colInfo.rows.length > 0 && colInfo.rows[0].data_type !== 'ARRAY') {
      console.log("Altering category column type to text[]...");
      await pool.query(
        `ALTER TABLE exercises ALTER COLUMN category TYPE text[] USING ARRAY[category];`
      );
      console.log("Column altered successfully.");
    } else {
      console.log("Column category is already ARRAY or target type.");
    }

    console.log("Updating muscle targets for existing exercises...");
    for (const [name, muscles] of Object.entries(muscleMappings)) {
      const res = await pool.query(
        `UPDATE exercises SET category = $1 WHERE name = $2 RETURNING *;`,
        [muscles, name]
      );
      if (res.rowCount && res.rowCount > 0) {
        console.log(`Updated '${name}':`, muscles);
      }
    }

    await pool.query(
      `UPDATE exercises SET category = array_replace(category, 'QUAT', 'QUADRICEPS');`
    );

    console.log("Migration and update completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await pool.end();
  }
}

main();
