import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

interface JwtPayload {
  sub: number;
  role?: string;
  isBlocked?: boolean;
  wardId?: number;
  tokenVersion?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  // Returns the user identity straight from the JWT — avoids a DB lookup on
  // every authenticated request. Revocation is handled via tokenVersion bumps,
  // which are checked in a guard for state-changing routes when needed.
  async validate(payload: JwtPayload) {
    if (payload.isBlocked) {
      throw new UnauthorizedException("User is blocked");
    }
    return {
      id: payload.sub,
      role: payload.role,
      wardId: payload.wardId,
      tokenVersion: payload.tokenVersion ?? 0,
    };
  }
}
