import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { NotificationsModule } from "./notifications.module";
import { NotificationsService } from "./notifications.service";
import { NotificationsController } from "./notifications.controller";

describe("NotificationsModule", () => {
  it("should define NotificationsService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, NotificationsModule) ?? [];

    expect(providers).toContain(NotificationsService);
  });

  it("should define NotificationsController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, NotificationsModule) ??
      [];

    expect(controllers).toContain(NotificationsController);
  });

  it("should export NotificationsService", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, NotificationsModule) ?? [];

    expect(exportsMetadata).toContain(NotificationsService);
  });
});
