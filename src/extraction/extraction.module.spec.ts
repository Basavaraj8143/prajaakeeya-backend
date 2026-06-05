import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { ExtractionModule } from "./extraction.module";
import { ExtractionService } from "./extraction.service";
import { ExtractionController } from "./extraction.controller";

describe("ExtractionModule", () => {
  it("should define ExtractionService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, ExtractionModule) ?? [];

    expect(providers).toContain(ExtractionService);
  });

  it("should define ExtractionController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, ExtractionModule) ?? [];

    expect(controllers).toContain(ExtractionController);
  });

  it("should export ExtractionService", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, ExtractionModule) ?? [];

    expect(exportsMetadata).toContain(ExtractionService);
  });
});
