import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AspirantMeeting } from "../aspirants/aspirant-meeting.entity";
import { AspirantVisit } from "../aspirants/aspirant-visit.entity";
import { Aspirant } from "../aspirants/aspirant.entity";
import { NotificationsModule } from "../notifications/notifications.module";
import { ElectionsModule } from "../elections/elections.module";
import { ReminderSchedulerService } from "./reminder-scheduler.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([AspirantMeeting, AspirantVisit, Aspirant]),
    NotificationsModule,
    ElectionsModule,
  ],
  providers: [ReminderSchedulerService],
})
export class RemindersModule {}
