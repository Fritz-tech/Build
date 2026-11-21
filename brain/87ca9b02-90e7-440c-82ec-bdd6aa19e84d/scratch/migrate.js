const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL, { prepare: false, connect_timeout: 10 });
sql`SELECT 1`.then(r => {
  console.log('DB Connected OK:', r);
  return sql`CREATE TABLE IF NOT EXISTS "project" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "prompt" text NOT NULL,
    "status" text NOT NULL DEFAULT 'queued',
    "assets" text DEFAULT '[]',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  )`;
}).then(() => {
  console.log('project table created/verified.');
  sql.end();
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
