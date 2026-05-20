import { Module, Global, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express";
import { MediaController } from "./controllers/media.controller";
import { MediaService } from "./services/media.service";
import { S3Service } from "./services/s3.service";
import { User } from "../users/user.entity";
import { Aspirant } from "../aspirants/aspirant.entity";
import { AdminDocument } from "../admin/admin-document.entity";
import { UserSignedDocument } from "../users/user-signed-document.entity";
import { MAX_UPLOAD_BYTES } from "./upload.constants";
import { AspirantsModule } from "../aspirants/aspirants.module";

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Aspirant,
      AdminDocument,
      UserSignedDocument,
    ]),
    MulterModule.register({
      limits: {
        fileSize: MAX_UPLOAD_BYTES,
      },
    }),
    forwardRef(() => AspirantsModule),
  ],
  controllers: [MediaController],
  providers: [MediaService, S3Service],
  exports: [MediaService, S3Service],
})
export class MediaModule {}
