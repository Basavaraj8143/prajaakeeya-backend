import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { AdminModule } from "./admin.module";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";

describe("AdminModule", () => {
  it("should define AdminService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AdminModule) ?? [];

    expect(providers).toContain(AdminService);
  });

  it("should define AdminController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AdminModule) ?? [];

    expect(controllers).toContain(AdminController);
  });
});
