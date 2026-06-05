import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { ForumModule } from "./forum.module";
import { ForumService } from "./forum.service";
import { ForumController } from "./forum.controller";

describe("ForumModule", () => {
  it("should define ForumService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, ForumModule) ?? [];

    expect(providers).toContain(ForumService);
  });

  it("should define ForumController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, ForumModule) ?? [];

    expect(controllers).toContain(ForumController);
  });

  it("should export ForumService", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, ForumModule) ?? [];

    expect(exportsMetadata).toContain(ForumService);
  });
});
