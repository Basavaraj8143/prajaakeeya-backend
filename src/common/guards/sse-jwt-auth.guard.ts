import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

/**
 * Auth guard for Server-Sent Events routes.
 *
 * The browser `EventSource` API cannot set request headers, so the JWT is read
 * from the `token` query param (falling back to a Bearer header for non-browser
 * clients). On success the decoded identity is attached to `req.user`.
 *
 * It also sets `X-Accel-Buffering: no` so SSE bytes stream immediately through
 * buffering proxies (nginx / ALB).
 *
 * NOTE: this verifies signature + expiry only — it does NOT run the Redis
 * `tokenVersion` revocation check used by the main JwtStrategy. That is an
 * acceptable trade-off for a read-only chat stream (a revoked token keeps
 * receiving messages only until the connection drops or the token expires).
 */
@Injectable()
export class SseJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    res.setHeader("X-Accel-Buffering", "no");

    const header: string | undefined = req.headers?.authorization;
    const token: string | undefined =
      (req.query?.token as string) ||
      (header?.startsWith("Bearer ") ? header.slice(7) : undefined);

    if (!token) throw new UnauthorizedException("Missing token");

    try {
      const payload: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      req.user = {
        id: payload.sub,
        role: payload.role,
        wardId: payload.wardId,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
