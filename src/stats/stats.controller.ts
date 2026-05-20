import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Public } from "../common/decorators/public.decorator";
import { StatsService } from "./stats.service";

@ApiTags("Stats")
@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get("constituency")
  @Public()
  @ApiOperation({
    summary:
      "Public — total voters and aspirants registered to an election constituency",
    description:
      "Voter count = users whose saved constituency (POST /users/me/constituencies) matches the given electionId+constituencyId. Aspirant count = active aspirants who have agreed to SOP and uploaded a selfie.",
  })
  @ApiQuery({ name: "electionId", required: true, type: Number })
  @ApiQuery({ name: "constituencyId", required: true, type: Number })
  @ApiResponse({ status: 200, description: "Stats returned" })
  @ApiResponse({ status: 404, description: "Election not found" })
  findStatsByConstituency(
    @Query("electionId") electionId: string,
    @Query("constituencyId") constituencyId: string,
  ) {
    return this.statsService.findStatsByConstituency(
      Number(electionId),
      Number(constituencyId),
    );
  }
}
