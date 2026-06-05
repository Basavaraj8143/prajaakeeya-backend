import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { VotesModule } from "./votes.module";
import { VotesService } from "./votes.service";
import { VotesController } from "./votes.controller";

describe("VotesModule", () => {
  it("should define VotesService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, VotesModule) ?? [];

    expect(providers).toContain(VotesService);
  });

  it("should define VotesController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, VotesModule) ?? [];

    expect(controllers).toContain(VotesController);
  });

  it("should export VotesService", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, VotesModule) ?? [];

    expect(exportsMetadata).toContain(VotesService);
  });
});
