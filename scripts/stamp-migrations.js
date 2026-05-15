/**
 * Mark all known migrations as already-applied in the TypeORM `migrations`
 * table. Use this when a DB was originally built with `synchronize:true`
 * so the schema exists but TypeORM doesn't know it — running migrations
 * normally would fail with "column already exists".
 *
 * Idempotent: only inserts rows that aren't already present.
 *
 * Usage on EC2:
 *   cd /home/ec2-user/prajaakeeya-api
 *   RDS_SSL_INSECURE=true node scripts/stamp-migrations.js
 */
require("dotenv").config({ path: __dirname + "/../.env" });
const { Client } = require("pg");

const MIGRATIONS = [
  [1739112000000, "AddVerificationIdToOtps1739112000000"],
  [1739200000000, "CreateReportsTable1739200000000"],
  [1739300000000, "AddMediaUploadFeatures1739300000000"],
  [1739400000000, "SwitchToEmailAuth1739400000000"],
  [1741240000000, "AddIsActiveToAspirants1741240000000"],
  [1741300000000, "AddSopKannadaToAspirants1741300000000"],
  [1741500000000, "AddTelegramGroupLinkToWards1741500000000"],
  [1772900000000, "AddEpicCardBackToAspirants1772900000000"],
  [1773000000000, "CreateMeetingResponsesTable1773000000000"],
  [1774000000000, "CreatePendingAspirantRegistrationsTable1774000000000"],
  [1775000000000, "AddTwitterWhatsappToAspirants1775000000000"],
  [1775100000000, "RemoveWardIdFromReports1775100000000"],
  [1775200000000, "AddIsSelfDeletedToUsers1775200000000"],
  [1775300000000, "AddHotPathIndexes1775300000000"],
  [1775400000000, "AddTokenVersionToUsers1775400000000"],
  [1775500000000, "AddConstituencyIdsToUsers1775500000000"],
  [1775700000000, "CreateNotificationsTable1775700000000"],
];

(async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const c = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await c.connect();

  // TypeORM creates this lazily on first run; create it explicitly here so
  // we can stamp rows before the app boots.
  await c.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      timestamp BIGINT NOT NULL,
      name VARCHAR NOT NULL
    )
  `);

  let inserted = 0;
  let skipped = 0;
  for (const [ts, name] of MIGRATIONS) {
    const existing = await c.query(
      "SELECT id FROM migrations WHERE name = $1",
      [name],
    );
    if (existing.rowCount > 0) {
      console.log("  · already stamped:", name);
      skipped++;
    } else {
      await c.query(
        "INSERT INTO migrations (timestamp, name) VALUES ($1, $2)",
        [ts, name],
      );
      console.log("  ✓ stamped:", name);
      inserted++;
    }
  }

  const total = await c.query("SELECT COUNT(*) FROM migrations");
  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped}.`);
  console.log(`Total rows in migrations: ${total.rows[0].count}`);

  await c.end();
})().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
