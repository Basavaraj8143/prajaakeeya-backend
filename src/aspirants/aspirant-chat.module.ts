import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { AspirantMessage } from "./aspirant-message.entity";
import { Aspirant } from "./aspirant.entity";
import { AspirantChatService } from "./aspirant-chat.service";
import { AspirantChatController } from "./aspirant-chat.controller";
import { ChatEventsService } from "./chat-events.service";
import { SseJwtAuthGuard } from "../common/guards/sse-jwt-auth.guard";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([AspirantMessage, Aspirant]),
    NotificationsModule,
    // Provides JwtService for the SSE query-token guard. The secret is supplied
    // per-verify from process.env, so no static secret is needed here.
    JwtModule.register({}),
  ],
  providers: [AspirantChatService, ChatEventsService, SseJwtAuthGuard],
  controllers: [AspirantChatController],
  exports: [AspirantChatService],
})
export class AspirantChatModule {}
