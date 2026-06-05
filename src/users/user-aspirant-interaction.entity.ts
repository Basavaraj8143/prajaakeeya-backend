import { Column, Entity, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from "../common/base.entity";
import { User } from "./user.entity";
import { Aspirant } from "../aspirants/aspirant.entity";

@Entity("user_aspirant_interactions")
@Unique(["userId", "aspirantId"])
export class UserAspirantInteraction extends BaseEntity {
  @Column()
  userId!: number;

  @ManyToOne(() => User)
  user!: User;

  @Column()
  aspirantId!: number;

  @ManyToOne(() => Aspirant)
  aspirant!: Aspirant;

  @Column({ default: false })
  isChat!: boolean;

  @Column({ default: false })
  isMeeting!: boolean;

  @Column({ default: false })
  isDirectMeet!: boolean;

  @Column({ default: false })
  isPhoneCall!: boolean;

  // When the voter last pressed the phone/WhatsApp ("contact") button for this
  // aspirant. Set by the track/phone-call endpoint from the click timestamp.
  @Column({ type: "timestamp", nullable: true })
  phoneCallAt?: Date | null;
}
