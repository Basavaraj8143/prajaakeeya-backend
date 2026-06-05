import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class TrackInteractionDto {
  @ApiProperty({
    description: "Aspirant ID",
    example: 1,
  })
  @IsNumber()
  aspirantId!: number;

  @ApiProperty({
    description:
      "Click time as epoch milliseconds (recorded for phone/WhatsApp 'contact' presses). Defaults to now if omitted.",
    example: 1780000000000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  timestamp?: number;
}
