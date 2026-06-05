import { Injectable, Logger } from "@nestjs/common";
import { Observable, Subject, filter } from "rxjs";

export interface ChatEvent {
  aspirantId: number;
  type: "message.created" | "message.deleted";
  payload: unknown;
}

/**
 * In-memory event bus that powers the chat SSE streams.
 *
 * IMPORTANT: this only fans out within a SINGLE Node process. Production runs
 * PM2 in `fork` mode (one process), so this is sufficient today. If you move to
 * PM2 cluster (`instances > 1` in ecosystem.config.js) or run multiple API
 * instances, a message saved by one process will NOT reach SSE clients
 * connected to another — replace this Subject with a Redis pub/sub bridge (you
 * already run Redis) so events cross processes.
 */
@Injectable()
export class ChatEventsService {
  private readonly logger = new Logger(ChatEventsService.name);
  private readonly events$ = new Subject<ChatEvent>();

  constructor() {
    if (process.env.NODE_APP_INSTANCE) {
      this.logger.warn(
        "Chat SSE uses an in-memory bus, but this process looks like a PM2 " +
          "cluster worker (NODE_APP_INSTANCE is set). Messages will only reach " +
          "SSE clients on the same worker — switch to Redis pub/sub for " +
          "multi-process delivery.",
      );
    }
  }

  publish(event: ChatEvent): void {
    this.events$.next(event);
  }

  /** Stream of events for a single aspirant chat room. */
  forRoom(aspirantId: number): Observable<ChatEvent> {
    return this.events$.pipe(filter((e) => e.aspirantId === aspirantId));
  }
}
