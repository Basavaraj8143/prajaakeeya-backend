import { Controller, Get, Param, Query, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { ElectionsService } from "./elections.service";
import { ElectionType } from "./election.entity";

@ApiTags("Elections")
@Controller("elections")
@UseInterceptors(CacheInterceptor)
@CacheTTL(3600_000)
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  @Get()
  @ApiOperation({ summary: "List all election types" })
  @ApiResponse({ status: 200, description: "List of elections returned" })
  findAll() {
    return this.electionsService.findAll();
  }

  @Get("municipalities")
  @ApiOperation({ summary: "List all city corporations / municipalities" })
  @ApiQuery({
    name: "state",
    required: false,
    example: "Karnataka",
    description: "Filter by state",
  })
  @ApiResponse({ status: 200, description: "List of municipalities returned" })
  getMunicipalities(@Query("state") state?: string) {
    return this.electionsService.getMunicipalities(state);
  }

  @Get("constituencies/by-scope")
  @ApiOperation({
    summary: "Get wards by municipality / city corporation name",
  })
  @ApiQuery({
    name: "scope",
    required: true,
    example: "Greater Bengaluru Authority(GBA) – Bengaluru",
    description: "City corporation name",
  })
  @ApiResponse({
    status: 200,
    description: "Wards for the given municipality returned",
  })
  getByScope(@Query("scope") scope: string) {
    return this.electionsService.getConstituenciesByScope(scope);
  }

  @Get(":type")
  @ApiOperation({ summary: "Get an election type by its type key" })
  @ApiParam({
    name: "type",
    enum: [
      "lok_sabha",
      "state_assembly",
      "municipal_corporation",
      "gram_panchayat",
    ],
  })
  @ApiResponse({ status: 200, description: "Election returned" })
  @ApiResponse({ status: 404, description: "Election type not found" })
  findByType(@Param("type") type: ElectionType) {
    return this.electionsService.findByType(type);
  }

  @Get(":type/constituencies")
  @ApiOperation({
    summary:
      "Get constituencies for an election type. For gram_panchayat, use filters to narrow down.",
  })
  @ApiParam({
    name: "type",
    enum: [
      "lok_sabha",
      "state_assembly",
      "municipal_corporation",
      "gram_panchayat",
    ],
  })
  @ApiQuery({
    name: "state",
    required: false,
    type: String,
    description: "Filter by state (gram_panchayat)",
  })
  @ApiQuery({
    name: "district",
    required: false,
    type: String,
    description: "Filter by district (gram_panchayat)",
  })
  @ApiQuery({
    name: "taluk",
    required: false,
    type: String,
    description: "Filter by taluk (gram_panchayat)",
  })
  @ApiQuery({
    name: "gpName",
    required: false,
    type: String,
    description: "Filter by GP name (gram_panchayat)",
  })
  @ApiResponse({
    status: 200,
    description: "Election with its constituencies returned",
  })
  @ApiResponse({ status: 404, description: "Election type not found" })
  getConstituencies(
    @Param("type") type: ElectionType,
    @Query("state") state?: string,
    @Query("district") district?: string,
    @Query("taluk") taluk?: string,
    @Query("gpName") gpName?: string,
  ) {
    return this.electionsService.getConstituencies(type, {
      state,
      district,
      taluk,
      gpName,
    });
  }
}
