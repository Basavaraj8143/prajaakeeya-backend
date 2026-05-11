import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds indexes covering the hot read paths identified in the production audit:
 * - Grama Panchayat cascading-dropdown lookups (state, district, taluk, GP).
 * - Foreign-key columns used in WHERE / GROUP BY on every list endpoint.
 * - Case-insensitive ward-name lookup for the electoral API ingest path.
 *
 * All statements are guarded by IF NOT EXISTS so this migration is safe to
 * re-run.
 */
export class AddHotPathIndexes1775300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const stmts = [
      // Grama Panchayat composite (fixes 30k-row scans on dropdowns)
      `CREATE INDEX IF NOT EXISTS idx_gp_lookup
         ON grama_panchayat ("State", "District", "Taluk", "GP Name")`,

      // Users
      `CREATE INDEX IF NOT EXISTS idx_users_ward       ON users ("wardId")`,
      `CREATE INDEX IF NOT EXISTS idx_users_role       ON users (role)`,
      `CREATE INDEX IF NOT EXISTS idx_users_phone      ON users (phone)`,
      `CREATE INDEX IF NOT EXISTS idx_users_email      ON users (email)`,
      `CREATE INDEX IF NOT EXISTS idx_users_epic       ON users (epic_id)`,
      `CREATE INDEX IF NOT EXISTS idx_users_voter_epic ON users (voter_epic)`,

      // Aspirants
      `CREATE INDEX IF NOT EXISTS idx_aspirants_user
         ON aspirants ("userId")`,
      `CREATE INDEX IF NOT EXISTS idx_aspirants_ward
         ON aspirants ("wardId")`,
      `CREATE INDEX IF NOT EXISTS idx_aspirants_election
         ON aspirants ("electionId")`,
      `CREATE INDEX IF NOT EXISTS idx_aspirants_constituency
         ON aspirants ("electionId", "constituencyId", "isActive")`,

      // Aspirant relations
      `CREATE INDEX IF NOT EXISTS idx_meetings_aspirant
         ON aspirant_meetings ("aspirantId")`,
      `CREATE INDEX IF NOT EXISTS idx_meeting_resp_meeting
         ON meeting_responses ("meetingId")`,
      `CREATE INDEX IF NOT EXISTS idx_meeting_resp_voter
         ON meeting_responses ("voterId")`,
      `CREATE INDEX IF NOT EXISTS idx_visits_aspirant
         ON aspirant_visits ("aspirantId")`,
      `CREATE INDEX IF NOT EXISTS idx_visit_resp_visit
         ON visit_responses ("visitId")`,
      `CREATE INDEX IF NOT EXISTS idx_visit_resp_voter
         ON visit_responses ("voterId")`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_aspirant
         ON aspirant_bookings ("aspirantId")`,
      `CREATE INDEX IF NOT EXISTS idx_bookings_voter
         ON aspirant_bookings ("voterId")`,
      `CREATE INDEX IF NOT EXISTS idx_activity_ratings_voter_asp
         ON activity_ratings ("voterId", "aspirantId", type, "activityId")`,

      // Votes
      `CREATE INDEX IF NOT EXISTS idx_votes_aspirant
         ON votes ("aspirantId")`,
      `CREATE INDEX IF NOT EXISTS idx_votes_ward       ON votes ("wardId")`,
      `CREATE INDEX IF NOT EXISTS idx_votes_user       ON votes ("userId")`,
      `CREATE INDEX IF NOT EXISTS idx_votes_window
         ON votes ("votingWindowId")`,

      // Issues / hand_raises
      `CREATE INDEX IF NOT EXISTS idx_handraises_lookup
         ON hand_raises ("electionId", "constituencyId", category)`,
      `CREATE INDEX IF NOT EXISTS idx_handraises_user
         ON hand_raises ("createdById")`,

      // Tracking
      `CREATE INDEX IF NOT EXISTS idx_uai_user_aspirant
         ON user_aspirant_interactions ("userId", "aspirantId")`,

      // Wards: case-insensitive name lookup
      `CREATE INDEX IF NOT EXISTS idx_ward_name_lower
         ON wards (LOWER(TRIM(name)))`,
    ];

    for (const sql of stmts) {
      try {
        await queryRunner.query(sql);
      } catch (e: any) {
        // Some tables/columns may not yet exist in older schema snapshots.
        // Log and continue so the migration is non-fatal.
        console.warn(
          `[AddHotPathIndexes] Skipped statement: ${sql.split("\n")[0].trim()} (${e.message})`,
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const drops = [
      "idx_gp_lookup",
      "idx_users_ward",
      "idx_users_role",
      "idx_users_phone",
      "idx_users_email",
      "idx_users_epic",
      "idx_users_voter_epic",
      "idx_aspirants_user",
      "idx_aspirants_ward",
      "idx_aspirants_election",
      "idx_aspirants_constituency",
      "idx_meetings_aspirant",
      "idx_meeting_resp_meeting",
      "idx_meeting_resp_voter",
      "idx_visits_aspirant",
      "idx_visit_resp_visit",
      "idx_visit_resp_voter",
      "idx_bookings_aspirant",
      "idx_bookings_voter",
      "idx_activity_ratings_voter_asp",
      "idx_votes_aspirant",
      "idx_votes_ward",
      "idx_votes_user",
      "idx_votes_window",
      "idx_handraises_lookup",
      "idx_handraises_user",
      "idx_uai_user_aspirant",
      "idx_ward_name_lower",
    ];
    for (const idx of drops) {
      await queryRunner.query(`DROP INDEX IF EXISTS ${idx}`);
    }
  }
}
