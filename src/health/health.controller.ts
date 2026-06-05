import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: "API health check" })
  @ApiResponse({ status: 200, description: "API is healthy" })
  async check() {
    let dbStatus: "up" | "down" = "down";
    try {
      await this.dataSource.query("SELECT 1");
      dbStatus = "up";
    } catch {
      dbStatus = "down";
    }

    return {
      status: dbStatus === "up" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
    };
  }

  // TEMPORARY — verifies Sentry is capturing errors. Throws on purpose so the
  // resulting 500 is reported to Sentry. Remove once you've confirmed the event
  // appears in the Sentry dashboard.
  @Get("debug-sentry")
  @ApiOperation({ summary: "TEST: throws an error to verify Sentry capture" })
  getError() {
    throw new Error("My first Sentry error!");
  }
}
