import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("Creating workspaces table...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id SERIAL PRIMARY KEY,
      code VARCHAR(12) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  console.log("Adding workspace_id to programs...");
  await pool.query(`
    ALTER TABLE programs
    ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES workspaces(id);
  `);

  console.log("Adding workspace_id to workout_sets...");
  await pool.query(`
    ALTER TABLE workout_sets
    ADD COLUMN IF NOT EXISTS workspace_id INTEGER REFERENCES workspaces(id);
  `);

  // Create a default workspace for existing data
  console.log("Creating default workspace for existing data...");
  const result = await pool.query(`
    INSERT INTO workspaces (code)
    VALUES ('DEFAULT001')
    ON CONFLICT (code) DO NOTHING
    RETURNING id;
  `);

  let defaultId: number;
  if (result.rows.length > 0) {
    defaultId = result.rows[0].id;
  } else {
    const existing = await pool.query(`SELECT id FROM workspaces WHERE code = 'DEFAULT001'`);
    defaultId = existing.rows[0].id;
  }

  console.log(`Default workspace id: ${defaultId}`);

  // Assign existing programs and workout_sets to default workspace
  await pool.query(`UPDATE programs SET workspace_id = $1 WHERE workspace_id IS NULL`, [defaultId]);
  await pool.query(`UPDATE workout_sets SET workspace_id = $1 WHERE workspace_id IS NULL`, [defaultId]);

  console.log("Migration complete!");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
