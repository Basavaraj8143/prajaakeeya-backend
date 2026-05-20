import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds `sop_agreed` / `sop_agreed_at` columns to aspirants. SOP is no
 * longer a file upload — aspirants electronically agree, and this flag
 * is the authoritative replacement for `sopUrl` in
 * `hasAllRequiredDocuments()`.
 *
 * Backfill: any aspirant who has a `sopUrl` (legacy file upload) is
 * treated as having agreed, so they don't get bounced back to
 * documentStatus=pending after this rolls out.
 */
export class AddSopAgreedToAspirants1775800000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "aspirants"
         ADD COLUMN IF NOT EXISTS "sop_agreed" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "aspirants"
         ADD COLUMN IF NOT EXISTS "sop_agreed_at" timestamp NULL`,
    );

    // Backfill: legacy aspirants who uploaded SOP are treated as agreed.
    await queryRunner.query(
      `UPDATE "aspirants"
         SET "sop_agreed" = true,
             "sop_agreed_at" = COALESCE("sop_agreed_at", "updated_at", now())
         WHERE "sopUrl" IS NOT NULL AND "sop_agreed" = false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "aspirants" DROP COLUMN IF EXISTS "sop_agreed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "aspirants" DROP COLUMN IF EXISTS "sop_agreed"`,
    );
  }
}
