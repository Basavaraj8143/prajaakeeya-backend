import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateGramaPanchayatDto {
  @ApiProperty({ example: "Karnataka" })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: "Bagalkote" })
  @IsString()
  @IsNotEmpty()
  district!: string;

  @ApiProperty({ example: "Badami" })
  @IsString()
  @IsNotEmpty()
  taluk!: string;

  @ApiProperty({ example: "Adagal" })
  @IsString()
  @IsNotEmpty()
  gpName!: string;

  @ApiProperty({ example: "Adagal" })
  @IsString()
  @IsNotEmpty()
  villageName!: string;

  @ApiPropertyOptional({ example: "598748" })
  @IsString()
  @IsOptional()
  villageCode?: string;

  @ApiPropertyOptional({ example: "5000" })
  @IsString()
  @IsOptional()
  population?: string;
}
