import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { PdfUploadModule } from "./pdf-upload.module";
import { PdfUploadController } from "./pdf-upload.controller";

describe("PdfUploadModule", () => {
  it("should define PdfUploadController as a controller", () => {
    const controllers =
      Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, PdfUploadModule) ?? [];

    expect(controllers).toContain(PdfUploadController);
  });
});
