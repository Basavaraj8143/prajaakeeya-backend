import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { AspirantWardMeetingsModule } from "./aspirant-ward-meetings.module";
import { AspirantWardMeetingsService } from "./aspirant-ward-meetings.service";
import { AspirantWardMeetingsController } from "./aspirant-ward-meetings.controller";

describe("AspirantWardMeetingsModule", () => {
  it("should define AspirantWardMeetingsService as a provider", () => {
    const providers =
      Reflect.getMetadata(
        MODULE_METADATA.PROVIDERS,
        AspirantWardMeetingsModule,
      ) ?? [];

    expect(providers).toContain(AspirantWardMeetingsService);
  });

  it("should define AspirantWardMeetingsController as a controller", () => {
    const controllers =
      Reflect.getMetadata(
        MODULE_METADATA.CONTROLLERS,
        AspirantWardMeetingsModule,
      ) ?? [];

    expect(controllers).toContain(AspirantWardMeetingsController);
  });
});
