import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

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

  try {
    // 1. Rename existing GBA wards to the full corporation name
    const wardResult = await queryRunner.query(`
      UPDATE wards
      SET municipality = 'Greater Bengaluru Authority(GBA) – Bengaluru'
      WHERE municipality = 'GBA'
    `);
    console.log(
      `✓ Updated ${wardResult[1] ?? 0} ward(s) municipality from 'GBA' to full name`,
    );

    // 2. Clear the old 'GBA' scope on the municipal_corporation election
    //    (scope is no longer used to filter a single corp — the service handles the full list)
    await queryRunner.query(`
      UPDATE elections
      SET scope = NULL
      WHERE type = 'municipal_corporation' AND scope = 'GBA'
    `);
    console.log(
      "✓ Cleared old 'GBA' scope from municipal_corporation election",
    );

    // 3. Make wards.assembly nullable (was NOT NULL previously)
    const colInfo = await queryRunner.query(`
      SELECT is_nullable
      FROM information_schema.columns
      WHERE table_name = 'wards' AND column_name = 'assembly'
    `);
    if (colInfo.length > 0 && colInfo[0].is_nullable === "NO") {
      await queryRunner.query(`
        ALTER TABLE wards
          ALTER COLUMN assembly DROP NOT NULL,
          ALTER COLUMN assembly SET DEFAULT 'N/A'
      `);
      console.log("✓ Made wards.assembly nullable with default N/A");
    } else {
      console.log("✓ wards.assembly is already nullable");
    }

    // 4. Update municipality column default for new wards
    await queryRunner.query(`
      ALTER TABLE wards
        ALTER COLUMN municipality SET DEFAULT 'Greater Bengaluru Authority(GBA) – Bengaluru'
    `);
    console.log("✓ Updated wards.municipality default to full GBA name");

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

if (require.main === module) {
  run().catch((err) => {
    console.error("Runner error:", err);
    process.exit(1);
  });
}
