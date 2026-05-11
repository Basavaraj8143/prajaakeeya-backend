import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Report } from "./report.entity";
import { UserSignedDocument } from "./user-signed-document.entity";
import { UserAspirantInteraction } from "./user-aspirant-interaction.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { Vote } from "../votes/vote.entity";
import { Message } from "../forum/message.entity";
import { AspirantMessage } from "../aspirants/aspirant-message.entity";
import { AspirantDiscussionMessage } from "../aspirant-discussion/aspirant-discussion-message.entity";
import { Aspirant } from "../aspirants/aspirant.entity";
import { AspirantBooking } from "../aspirants/aspirant-booking.entity";
import { VisitResponse } from "../aspirants/visit-response.entity";
import { WardMeeting } from "../wards/ward-meeting.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Report,
      UserSignedDocument,
      UserAspirantInteraction,
      Vote,
      Message,
      AspirantMessage,
      AspirantDiscussionMessage,
      Aspirant,
      AspirantBooking,
      VisitResponse,
      WardMeeting,
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
