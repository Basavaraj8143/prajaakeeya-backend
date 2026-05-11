import { IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class UpdateConstituenciesDto {
  @ApiProperty({
    description: "Lok Sabha (parliamentary) constituency ID",
    example: 12,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lokSabhaConstituencyId?: number;

  @ApiProperty({
    description: "State Assembly constituency ID",
    example: 153,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  stateAssemblyConstituencyId?: number;

  @ApiProperty({
    description: "Municipal Corporation constituency ID (ward ID)",
    example: 42,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  municipalCorporationConstituencyId?: number;

  @ApiProperty({
    description: "Gram Panchayat constituency ID (village sr_no)",
    example: 1057,
    required: false,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  gramPanchayatConstituencyId?: number;
}
