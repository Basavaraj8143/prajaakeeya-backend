import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { VerificationModule } from "./verification.module";
import { VerificationService } from "./verification.service";
import { VerificationController } from "./verification.controller";

describe("VerificationModule", () => {
  it("should define VerificationService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, VerificationModule) ?? [];

    expect(providers).toContain(VerificationService);
  });

  it("should define VerificationController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, VerificationModule) ?? [];

    expect(controllers).toContain(VerificationController);
  });
});
