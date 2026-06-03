import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification } from "./notification.entity";
import { FcmToken } from "./fcm-token.entity";
import { NotificationsService } from "./notifications.service";
import { FirebaseService } from "./firebase.service";
import { NotificationsController } from "./notifications.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Notification, FcmToken])],
  providers: [NotificationsService, FirebaseService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
