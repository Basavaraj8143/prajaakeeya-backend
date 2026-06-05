import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { AspirantDiscussionModule } from "./aspirant-discussion.module";
import { AspirantDiscussionService } from "./aspirant-discussion.service";
import { AspirantDiscussionController } from "./aspirant-discussion.controller";

describe("AspirantDiscussionModule", () => {
  it("should define AspirantDiscussionService as a provider", () => {
    const providers =
      Reflect.getMetadata(
        MODULE_METADATA.PROVIDERS,
        AspirantDiscussionModule,
      ) ?? [];

    expect(providers).toContain(AspirantDiscussionService);
  });

  it("should define AspirantDiscussionController as a controller", () => {
    const controllers =
      Reflect.getMetadata(
        MODULE_METADATA.CONTROLLERS,
        AspirantDiscussionModule,
      ) ?? [];

    expect(controllers).toContain(AspirantDiscussionController);
  });

  it("should export AspirantDiscussionService", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, AspirantDiscussionModule) ??
      [];

    expect(exportsMetadata).toContain(AspirantDiscussionService);
  });
});
