import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { ElectionsModule } from "./elections.module";
import { ElectionsService } from "./elections.service";
import { ElectionsController } from "./elections.controller";

describe("ElectionsModule", () => {
  it("should define ElectionsService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, ElectionsModule) ?? [];

    expect(providers).toContain(ElectionsService);
  });

  it("should define ElectionsController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, ElectionsModule) ?? [];

    expect(controllers).toContain(ElectionsController);
  });

  it("should export ElectionsService", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, ElectionsModule) ?? [];

    expect(exportsMetadata).toContain(ElectionsService);
  });
});
