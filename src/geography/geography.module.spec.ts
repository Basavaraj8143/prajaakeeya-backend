import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { GeographyModule } from "./geography.module";
import { GeographyService } from "./geography.service";
import { ParliamentaryService } from "./parliamentary.service";
import { AssemblyService } from "./assembly.service";
import { MunicipalityService } from "./municipality.service";
import { GeographyController } from "./geography.controller";
import { ParliamentaryController } from "./parliamentary.controller";
import { AssemblyController } from "./assembly.controller";

describe("GeographyModule", () => {
  it("should define all geography services as providers", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, GeographyModule) ?? [];

    expect(providers).toContain(GeographyService);
    expect(providers).toContain(ParliamentaryService);
    expect(providers).toContain(AssemblyService);
    expect(providers).toContain(MunicipalityService);
  });

  it("should define all geography controllers", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, GeographyModule) ?? [];

    expect(controllers).toContain(GeographyController);
    expect(controllers).toContain(ParliamentaryController);
    expect(controllers).toContain(AssemblyController);
  });

  it("should export all geography services", () => {
    const exportsMetadata =
      Reflect.getMetadata(MODULE_METADATA.EXPORTS, GeographyModule) ?? [];

    expect(exportsMetadata).toContain(GeographyService);
    expect(exportsMetadata).toContain(ParliamentaryService);
    expect(exportsMetadata).toContain(AssemblyService);
    expect(exportsMetadata).toContain(MunicipalityService);
  });
});
