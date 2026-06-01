import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { AspirantMeeting } from "../aspirants/aspirant-meeting.entity";
import { AspirantVisit } from "../aspirants/aspirant-visit.entity";
import { Aspirant } from "../aspirants/aspirant.entity";
import { NotificationsService } from "../notifications/notifications.service";
import { ElectionsService } from "../elections/elections.service";
import { ElectionType } from "../elections/election.entity";

const FIFTEEN_MIN_MS = 15 * 60 * 1000;
// Grace window for the "starting now" notification: catches items whose start
// time just passed (e.g. if the box was briefly down) without ever firing for
// long-finished ones.
const START_GRACE_MS = 5 * 60 * 1000;

interface ConstituencyContext {
  electionType: ElectionType;
  constituencyName: string | null;
}

/**
 * Sends meeting/visit reminders on a per-minute tick. For BOTH meetings and
 * visits:
 *   • 15 minutes before start
 *   • at start time ("starting now")
 *
 * Recipients are every voter in the aspirant's constituency (same audience as
 * the original "scheduled" notification). Each reminder is guarded by a
 * `reminder_*_sent` flag on the row so it is sent exactly once.
 */
@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    @InjectRepository(AspirantMeeting)
    private readonly meetingRepo: Repository<AspirantMeeting>,
    @InjectRepository(AspirantVisit)
    private readonly visitRepo: Repository<AspirantVisit>,
    @InjectRepository(Aspirant)
    private readonly aspirantRepo: Repository<Aspirant>,
    private readonly notifications: NotificationsService,
    private readonly electionsService: ElectionsService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick(): Promise<void> {
    // In PM2 cluster mode every worker would run this cron — only let worker 0
    // do it, otherwise reminders would be sent N times. (Single-process runs
    // have NODE_APP_INSTANCE unset, so this passes.)
    if (
      process.env.NODE_APP_INSTANCE &&
      process.env.NODE_APP_INSTANCE !== "0"
    ) {
      return;
    }

    const now = Date.now();
    try {
      await this.sendMeetingBeforeReminders(now);
      await this.sendMeetingStartNotifications(now);
      await this.sendVisitBeforeReminders(now);
      await this.sendVisitStartNotifications(now);
    } catch (err) {
      this.logger.error(`reminder tick failed: ${(err as Error).message}`);
    }
  }

  // ── Meetings ────────────────────────────────────────────────────────────

  private async sendMeetingBeforeReminders(now: number): Promise<void> {
    const windowEnd = now + FIFTEEN_MIN_MS;
    const meetings = await this.meetingRepo
      .createQueryBuilder("m")
      .where("m.reminderBeforeSent = false")
      .andWhere("m.startTime IS NOT NULL")
      .andWhere("m.startTime > :now", { now })
      .andWhere("m.startTime <= :windowEnd", { windowEnd })
      .getMany();

    for (const meeting of meetings) {
      const resolved = await this.resolveAspirantContext(meeting.aspirantId);
      if (resolved) {
        await this.notifications.notifyMeetingReminder(
          resolved.aspirant,
          meeting,
          resolved.context,
        );
      }
      meeting.reminderBeforeSent = true;
      await this.meetingRepo.save(meeting);
    }
  }

  private async sendMeetingStartNotifications(now: number): Promise<void> {
    const graceStart = now - START_GRACE_MS;
    const meetings = await this.meetingRepo
      .createQueryBuilder("m")
      .where("m.reminderStartSent = false")
      .andWhere("m.startTime IS NOT NULL")
      .andWhere("m.startTime <= :now", { now })
      .andWhere("m.startTime > :graceStart", { graceStart })
      .getMany();

    for (const meeting of meetings) {
      const resolved = await this.resolveAspirantContext(meeting.aspirantId);
      if (resolved) {
        await this.notifications.notifyMeetingStart(
          resolved.aspirant,
          meeting,
          resolved.context,
        );
      }
      meeting.reminderStartSent = true;
      await this.meetingRepo.save(meeting);
    }
  }

  // ── Visits ──────────────────────────────────────────────────────────────

  private async sendVisitBeforeReminders(now: number): Promise<void> {
    const windowEnd = now + FIFTEEN_MIN_MS;
    const visits = await this.visitRepo
      .createQueryBuilder("v")
      .where("v.reminderBeforeSent = false")
      .andWhere("v.startTime IS NOT NULL")
      .andWhere("v.startTime > :now", { now })
      .andWhere("v.startTime <= :windowEnd", { windowEnd })
      .getMany();

    for (const visit of visits) {
      const resolved = await this.resolveAspirantContext(visit.aspirantId);
      if (resolved) {
        await this.notifications.notifyVisitReminder(
          resolved.aspirant,
          visit,
          resolved.context,
        );
      }
      visit.reminderBeforeSent = true;
      await this.visitRepo.save(visit);
    }
  }

  private async sendVisitStartNotifications(now: number): Promise<void> {
    const graceStart = now - START_GRACE_MS;
    const visits = await this.visitRepo
      .createQueryBuilder("v")
      .where("v.reminderStartSent = false")
      .andWhere("v.startTime IS NOT NULL")
      .andWhere("v.startTime <= :now", { now })
      .andWhere("v.startTime > :graceStart", { graceStart })
      .getMany();

    for (const visit of visits) {
      const resolved = await this.resolveAspirantContext(visit.aspirantId);
      if (resolved) {
        await this.notifications.notifyVisitStart(
          resolved.aspirant,
          visit,
          resolved.context,
        );
      }
      visit.reminderStartSent = true;
      await this.visitRepo.save(visit);
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  /** Load the aspirant and resolve its election type for recipient lookup. */
  private async resolveAspirantContext(
    aspirantId: number,
  ): Promise<{ aspirant: Aspirant; context: ConstituencyContext } | null> {
    const aspirant = await this.aspirantRepo.findOne({
      where: { id: aspirantId },
    });
    if (!aspirant || !aspirant.electionId || !aspirant.constituencyId) {
      return null;
    }
    try {
      const election = await this.electionsService.findById(aspirant.electionId);
      if (!election) return null;
      return {
        aspirant,
        context: {
          electionType: election.type as ElectionType,
          constituencyName: null,
        },
      };
    } catch {
      return null;
    }
  }
}
