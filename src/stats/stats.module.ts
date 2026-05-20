import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/user.entity";
import { Aspirant } from "../aspirants/aspirant.entity";
import { ElectionsModule } from "../elections/elections.module";
import { StatsService } from "./stats.service";
import { StatsController } from "./stats.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User, Aspirant]), ElectionsModule],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
