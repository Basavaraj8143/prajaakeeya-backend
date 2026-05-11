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
    // Add isBlocked column to users table
    const checkBlockedColumn = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='is_blocked';
    `);

    if (checkBlockedColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE users 
        ADD COLUMN "is_blocked" BOOLEAN DEFAULT false;
      `);
      console.log("✓ Added is_blocked column to users table");
    } else {
      console.log("✓ is_blocked column already exists in users table");
    }

    // Create ward_meetings table
    const checkMeetingsTable = await queryRunner.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name='ward_meetings';
    `);

    if (checkMeetingsTable.length === 0) {
      await queryRunner.query(`
        CREATE TABLE ward_meetings (
          id SERIAL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ward_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          meeting_link TEXT NOT NULL,
          scheduled_at TIMESTAMP,
          created_by_id INTEGER NOT NULL,
          is_active BOOLEAN DEFAULT true,
          CONSTRAINT fk_ward FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
          CONSTRAINT fk_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);
      console.log("✓ Created ward_meetings table");
    } else {
      console.log("✓ ward_meetings table already exists");
    }

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
