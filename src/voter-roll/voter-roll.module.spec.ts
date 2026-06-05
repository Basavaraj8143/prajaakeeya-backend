import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { VoterRollModule } from "./voter-roll.module";
import { VoterRollService } from "./voter-roll.service";
import { VoterRollController } from "./voter-roll.controller";

describe("VoterRollModule", () => {
  it("should define VoterRollService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, VoterRollModule) ?? [];

    expect(providers).toContain(VoterRollService);
  });

  it("should define VoterRollController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, VoterRollModule) ?? [];

    expect(controllers).toContain(VoterRollController);
  });

  it("should export VoterRollService", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, VoterRollModule) ?? [];

    expect(exportsMetadata).toContain(VoterRollService);
  });
});
