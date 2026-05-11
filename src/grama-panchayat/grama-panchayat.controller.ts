import { Controller, Get, Query, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { GramaPanchayatService } from "./grama-panchayat.service";

@ApiTags("Grama Panchayat")
@Controller("grama-panchayat")
@UseInterceptors(CacheInterceptor)
@CacheTTL(3600_000)
export class GramaPanchayatController {
  constructor(private readonly service: GramaPanchayatService) {}

  @Get("states")
  @ApiOperation({ summary: "Get all states" })
  @ApiResponse({ status: 200, description: "List of states" })
  getStates() {
    return this.service.getStates();
  }

  @Get("districts")
  @ApiOperation({ summary: "Get districts for a state" })
  @ApiQuery({
    name: "state",
    required: true,
    type: String,
    example: "Karnataka",
  })
  @ApiResponse({ status: 200, description: "List of districts" })
  getDistricts(@Query("state") state: string) {
    return this.service.getDistricts(state);
  }

  @Get("taluks")
  @ApiOperation({ summary: "Get taluks for a state + district" })
  @ApiQuery({
    name: "state",
    required: true,
    type: String,
    example: "Karnataka",
  })
  @ApiQuery({
    name: "district",
    required: true,
    type: String,
    example: "Bagalkote",
  })
  @ApiResponse({ status: 200, description: "List of taluks" })
  getTaluks(
    @Query("state") state: string,
    @Query("district") district: string,
  ) {
    return this.service.getTaluks(state, district);
  }

  @Get("gps")
  @ApiOperation({
    summary: "Get Gram Panchayats for a state + district + taluk",
  })
  @ApiQuery({
    name: "state",
    required: true,
    type: String,
    example: "Karnataka",
  })
  @ApiQuery({
    name: "district",
    required: true,
    type: String,
    example: "Bagalkote",
  })
  @ApiQuery({ name: "taluk", required: true, type: String, example: "Badami" })
  @ApiResponse({ status: 200, description: "List of Gram Panchayats" })
  getGPs(
    @Query("state") state: string,
    @Query("district") district: string,
    @Query("taluk") taluk: string,
  ) {
    return this.service.getGPs(state, district, taluk);
  }

  @Get("villages")
  @ApiOperation({ summary: "Get villages for a state + district + taluk + GP" })
  @ApiQuery({
    name: "state",
    required: true,
    type: String,
    example: "Karnataka",
  })
  @ApiQuery({
    name: "district",
    required: true,
    type: String,
    example: "Bagalkote",
  })
  @ApiQuery({ name: "taluk", required: true, type: String, example: "Badami" })
  @ApiQuery({ name: "gpName", required: true, type: String, example: "Adagal" })
  @ApiResponse({
    status: 200,
    description: "List of villages with codes and population",
  })
  getVillages(
    @Query("state") state: string,
    @Query("district") district: string,
    @Query("taluk") taluk: string,
    @Query("gpName") gpName: string,
  ) {
    return this.service.getVillages(state, district, taluk, gpName);
  }
}
