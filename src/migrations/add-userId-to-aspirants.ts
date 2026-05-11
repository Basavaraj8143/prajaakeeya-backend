import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Migration: Add userId column to aspirants table
 *
 * This migration:
 * 1. Adds userId column to aspirants table
 * 2. Attempts to link existing aspirants to users by matching wardId and name (case-insensitive)
 *
 * Run with: npx ts-node src/migrations/add-userId-to-aspirants.ts
 */
async function migrate() {
  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
  });

  await dataSource.initialize();
  console.log("Database connected");

  try {
    // Check if column already exists
    const checkColumn = await dataSource.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='aspirants' AND column_name='userId';
    `);

    if (checkColumn.length > 0) {
      console.log("✓ userId column already exists in aspirants table");
    } else {
      // Add userId column
      await dataSource.query(`
        ALTER TABLE aspirants 
        ADD COLUMN "userId" INTEGER NULL;
      `);
      console.log("✓ Added userId column to aspirants table");
    }

    // Link existing aspirants to users by matching wardId and name
    const updated = await dataSource.query(`
      UPDATE aspirants a
      SET "userId" = u.id
      FROM users u
      WHERE a."wardId" = u."wardId" 
        AND LOWER(a.name) = LOWER(u.name)
        AND a."userId" IS NULL
        AND u.role = 'aspirant';
    `);

    console.log(
      `✓ Linked ${updated[1]} existing aspirants to their user accounts`,
    );

    // Add foreign key constraint
    const checkConstraint = await dataSource.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name='aspirants' AND constraint_name='FK_aspirants_userId';
    `);

    if (checkConstraint.length === 0) {
      await dataSource.query(`
        ALTER TABLE aspirants
        ADD CONSTRAINT "FK_aspirants_userId" 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL;
      `);
      console.log("✓ Added foreign key constraint");
    } else {
      console.log("✓ Foreign key constraint already exists");
    }

    // Show unlinked aspirants (if any)
    const unlinked = await dataSource.query(`
      SELECT id, name, "wardId" 
      FROM aspirants 
      WHERE "userId" IS NULL;
    `);

    if (unlinked.length > 0) {
      console.log(
        `\n⚠ Warning: ${unlinked.length} aspirants could not be linked to users:`,
      );
      unlinked.forEach((a: any) => {
        console.log(`  - ID ${a.id}: ${a.name} (Ward ID: ${a.wardId})`);
      });
      console.log(
        "\nThese aspirants may need manual linking or will be linked when they next log in.\n",
      );
    } else {
      console.log("\n✓ All aspirants successfully linked to user accounts\n");
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
