import "reflect-metadata";
import { MODULE_METADATA } from "@nestjs/common/constants";

import { RemindersModule } from "./reminders.module";
import { ReminderSchedulerService } from "./reminder-scheduler.service";

describe("RemindersModule", () => {
  it("should define ReminderSchedulerService as a provider", () => {
    const providers =
      Reflect.getMetadata(MODULE_METADATA.PROVIDERS, RemindersModule) ?? [];

    expect(providers).toContain(ReminderSchedulerService);
  });
});
