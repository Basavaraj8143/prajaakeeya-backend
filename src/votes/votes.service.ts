import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Vote } from "./vote.entity";
import { VotingWindow } from "./voting-window.entity";
import { CastVoteDto } from "./dto/cast-vote.dto";
import { SetVotingWindowDto } from "./dto/set-voting-window.dto";
import { UsersService } from "../users/users.service";
import { WardsService } from "../wards/wards.service";
import { AspirantsService } from "../aspirants/aspirants.service";

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote) private readonly repo: Repository<Vote>,
    @InjectRepository(VotingWindow)
    private readonly votingWindowRepo: Repository<VotingWindow>,
    private readonly usersService: UsersService,
    private readonly wardsService: WardsService,
    @Inject(forwardRef(() => AspirantsService))
    private readonly aspirantsService: AspirantsService,
  ) {}

  async castVote(userId: number, dto: CastVoteDto) {
    // Check voting window and get the active window
    await this.checkVotingWindow();
    const activeWindow = await this.getActiveVotingWindow();
    if (!activeWindow) {
      throw new BadRequestException("No voting window is currently active");
    }

    // Per-user uniqueness within this voting window
    const exists = await this.repo.findOne({
      where: { userId, votingWindowId: activeWindow.id },
    });
    if (exists)
      throw new BadRequestException(
        "You have already voted in this voting window",
      );

    // Validate aspirant exists
    const aspirant = await this.aspirantsService.findOne(dto.aspirantId);
    if (!aspirant) throw new NotFoundException("Aspirant not found");
    if (aspirant.isActive === false)
      throw new BadRequestException(
        "This aspirant has withdrawn candidacy and cannot receive votes",
      );

    // Check if user has any interaction
    const hasInteracted = await this.usersService.hasAnyInteraction(userId);
    if (!hasInteracted) {
      throw new BadRequestException(
        "You must interact (via chat, meeting, direct meet, or phone call) before voting",
      );
    }

    return this.repo.save(
      this.repo.create({
        aspirantId: dto.aspirantId,
        wardId: aspirant.wardId ?? undefined,
        userId,
        votingWindowId: activeWindow.id,
      }),
    );
  }

  async wardResults(wardId: number) {
    return this.repo
      .createQueryBuilder("vote")
      .leftJoin("vote.aspirant", "aspirant")
      .select("vote.aspirantId", "aspirantId")
      .addSelect("aspirant.name", "aspirantName")
      .addSelect("COUNT(vote.id)", "totalVotes")
      .where("vote.wardId = :wardId", { wardId })
      .groupBy("vote.aspirantId")
      .addGroupBy("aspirant.name")
      .orderBy('"totalVotes"', "DESC")
      .getRawMany();
  }

  findUserVote(userId: number, wardId: number) {
    return this.repo.findOne({ where: { userId, wardId } });
  }

  async hasUserVotedInActiveWindow(userId: number): Promise<boolean> {
    const window = await this.getActiveVotingWindow();
    if (!window) return false;
    const vote = await this.repo.findOne({
      where: { userId, votingWindowId: window.id },
    });
    return !!vote;
  }

  async countByAspirantIds(
    aspirantIds: number[],
  ): Promise<Record<number, number>> {
    if (!aspirantIds.length) return {};

    const activeWindow = await this.getActiveVotingWindow();
    const qb = this.repo
      .createQueryBuilder("vote")
      .select("vote.aspirantId", "aspirantId")
      .addSelect("COUNT(vote.id)", "count")
      .where("vote.aspirantId IN (:...aspirantIds)", { aspirantIds });

    if (activeWindow) {
      qb.andWhere("vote.votingWindowId = :windowId", {
        windowId: activeWindow.id,
      });
    }

    const results = await qb.groupBy("vote.aspirantId").getRawMany();
    const map: Record<number, number> = {};
    for (const r of results) {
      map[Number(r.aspirantId)] = Number(r.count);
    }
    return map;
  }

  count() {
    return this.repo.count();
  }

  // Voting Window Management
  async setVotingWindow(dto: SetVotingWindowDto) {
    // Deactivate all existing windows using query builder
    await this.votingWindowRepo
      .createQueryBuilder()
      .update()
      .set({ isActive: false })
      .execute();

    // Create new active window linked to election
    const window = this.votingWindowRepo.create({
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      description: dto.description,
      electionId: dto.electionId,
      isActive: true,
    });

    return this.votingWindowRepo.save(window);
  }

  async getActiveVotingWindow() {
    return this.votingWindowRepo.findOne({
      where: { isActive: true },
      relations: ["election"],
      order: { createdAt: "DESC" },
    });
  }

  async getAllVotingWindows() {
    return this.votingWindowRepo.find({
      relations: ["election"],
      order: { createdAt: "DESC" },
    });
  }

  async isVotingAllowed(): Promise<boolean> {
    const window = await this.getActiveVotingWindow();
    if (!window) return false;

    // startTime / endTime arrive as epoch-ms numbers via the entity transformer.
    const nowMs = Date.now();
    return nowMs >= Number(window.startTime) && nowMs <= Number(window.endTime);
  }

  async checkVotingWindow() {
    const allowed = await this.isVotingAllowed();
    if (!allowed) {
      const window = await this.getActiveVotingWindow();
      if (!window) {
        throw new BadRequestException("No voting window is currently active");
      }

      const nowMs = Date.now();
      const startsAt = Number(window.startTime);
      const closedAt = Number(window.endTime);
      if (nowMs < startsAt) {
        throw new BadRequestException({
          message: "Voting has not started yet.",
          startsAt,
        });
      }
      if (nowMs > closedAt) {
        throw new BadRequestException({
          message: "Voting has ended.",
          closedAt,
        });
      }
    }
  }
}
