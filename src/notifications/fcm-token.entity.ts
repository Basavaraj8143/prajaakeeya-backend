import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * A Firebase Cloud Messaging registration token for a user's web client
 * (browser / installed PWA). A user can have several (one per device/browser);
 * a token is globally unique and is reassigned if the same device logs in as a
 * different user. Invalid tokens are pruned automatically when a send fails.
 */
@Entity("fcm_tokens")
export class FcmToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column({ name: "user_id", type: "int" })
  userId!: number;

  @Index({ unique: true })
  @Column({ type: "text" })
  token!: string;

  @Column({ type: "varchar", length: 32, nullable: true })
  platform?: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
