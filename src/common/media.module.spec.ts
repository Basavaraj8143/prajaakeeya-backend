import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { MediaModule } from "./media.module";
import { MediaService } from "./services/media.service";
import { S3Service } from "./services/s3.service";
import { MediaController } from "./controllers/media.controller";

describe("MediaModule", () => {
  it("should define MediaService and S3Service as providers", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, MediaModule) ?? [];

    expect(providers).toContain(MediaService);
    expect(providers).toContain(S3Service);
  });

  it("should define MediaController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, MediaModule) ?? [];

    expect(controllers).toContain(MediaController);
  });

  it("should export MediaService and S3Service", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, MediaModule) ?? [];

    expect(exportsMetadata).toContain(MediaService);
    expect(exportsMetadata).toContain(S3Service);
  });
});
