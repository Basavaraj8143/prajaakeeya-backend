import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Migration: Add address column to aspirants table
 *
 * Run with: npx ts-node src/migrations/add-address-to-aspirants.ts
 */
async function migrate() {
  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
  });

  await dataSource.initialize();
  console.log("Database connected");

  try {
    const checkColumn = await dataSource.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name='aspirants' AND column_name='address';
    `);

    if (checkColumn.length > 0) {
      console.log("✓ address column already exists in aspirants table");
    } else {
      await dataSource.query(`
        ALTER TABLE aspirants
        ADD COLUMN "address" TEXT NULL;
      `);
      console.log("✓ Added address column to aspirants table");
    }
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }

  console.log("✓ Migration completed successfully!");
}

if (require.main === module) {
  migrate().catch((error) => {
    console.error("Error running migration:", error);
    process.exit(1);
  });
}
