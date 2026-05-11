import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { CreateReportsTable1739200000000 } from "./1739200000000-create-reports-table";

dotenv.config();

async function run() {
  const dataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
  });

  await dataSource.initialize();
  console.log("Database connected");

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  const migration = new CreateReportsTable1739200000000();
  try {
    await migration.up(queryRunner);
    console.log("✓ Reports migration applied successfully");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

// Only auto-run when invoked directly (`node run-create-reports.js`),
// never when imported by TypeORM's migrations glob.
if (require.main === module) {
  run().catch((err) => {
    console.error("Runner error:", err);
    process.exit(1);
  });
}
