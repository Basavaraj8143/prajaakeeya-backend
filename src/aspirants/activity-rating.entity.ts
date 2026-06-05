import { Column, Entity, Index } from "typeorm";
import { BaseEntity } from "../common/base.entity";

@Index(["type", "activityId", "voterId"], { unique: true })
@Entity("activity_ratings")
export class ActivityRating extends BaseEntity {
  @Column({ type: "varchar" })
  type!: "meeting" | "visit" | "contact";

  // For "meeting"/"visit" this is the meeting/visit id. For "contact" (a
  // combined phone + WhatsApp rating) there is no activity, so it holds the
  // aspirantId — giving one contact rating per voter per aspirant via the
  // (type, activityId, voterId) unique index.
  @Column()
  activityId!: number;

  @Column()
  aspirantId!: number;

  @Column()
  voterId!: number;

  @Column({ type: "int" })
  rating!: number; // 1-5
}
