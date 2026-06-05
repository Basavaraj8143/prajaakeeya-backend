import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { StatsModule } from "./stats.module";
import { StatsService } from "./stats.service";
import { StatsController } from "./stats.controller";

describe("StatsModule", () => {
  it("should define StatsService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, StatsModule) ?? [];

    expect(providers).toContain(StatsService);
  });

  it("should define StatsController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, StatsModule) ?? [];

    expect(controllers).toContain(StatsController);
  });
});
