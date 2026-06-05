import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneCallAtToInteractions1782000000000
  implements MigrationInterface
{
  name = "AddPhoneCallAtToInteractions1782000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_aspirant_interactions" ADD COLUMN IF NOT EXISTS "phoneCallAt" TIMESTAMP;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_aspirant_interactions" DROP COLUMN IF EXISTS "phoneCallAt";`,
    );
  }
}
