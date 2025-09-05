import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET_KEY', { infer: true }) ?? (() => {
        throw new Error('JWT_SECRET_KEY is not defined in environment variables');
      })(),
    });
  }

  async validate(payload: any) {
    const { sub: userId, email, roleId, organizationId } = payload;

    return {
      userId,
      email,
      roleId,
      ...(organizationId && { organizationId }),
    };
  }
}
