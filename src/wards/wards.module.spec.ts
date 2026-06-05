import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { WardsModule } from "./wards.module";
import { WardsService } from "./wards.service";
import { WardsController } from "./wards.controller";

describe("WardsModule", () => {
  it("should define WardsService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, WardsModule) ?? [];

    expect(providers).toContain(WardsService);
  });

  it("should define WardsController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, WardsModule) ?? [];

    expect(controllers).toContain(WardsController);
  });

  it("should export WardsService", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, WardsModule) ?? [];

    expect(exportsMetadata).toContain(WardsService);
  });
});
