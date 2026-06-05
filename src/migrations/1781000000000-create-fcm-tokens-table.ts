import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFcmTokensTable1781000000000 implements MigrationInterface {
  name = "CreateFcmTokensTable1781000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fcm_tokens" (
        "id" SERIAL PRIMARY KEY,
        "user_id" integer NOT NULL,
        "token" text NOT NULL,
        "platform" varchar(32),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_fcm_tokens_token" ON "fcm_tokens" ("token");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_fcm_tokens_user_id" ON "fcm_tokens" ("user_id");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "fcm_tokens";`);
  }
}
