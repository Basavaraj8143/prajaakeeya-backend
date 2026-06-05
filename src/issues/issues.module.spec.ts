import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { IssuesModule } from "./issues.module";
import { IssuesService } from "./issues.service";
import { IssuesController } from "./issues.controller";

describe("IssuesModule", () => {
  it("should define IssuesService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, IssuesModule) ?? [];

    expect(providers).toContain(IssuesService);
  });

  it("should define IssuesController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, IssuesModule) ?? [];

    expect(controllers).toContain(IssuesController);
  });

  it("should export IssuesService", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, IssuesModule) ?? [];

    expect(exportsMetadata).toContain(IssuesService);
  });
});
