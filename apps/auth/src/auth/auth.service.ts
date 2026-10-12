import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  revokeSession,
  getRedisClient,
  generateTotpSecret,
  generateOtpauthUrl,
  verifyTotpCode,
  generateRecoveryCodes,
  verifyAndConsumeRecoveryCode,
  encryptMfaSecret,
  resolveMfaSecret,
} from '@repo/auth';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && user.passwordHash) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    // If MFA is enabled on user, return an MFA challenge rather than full access token
    if (user.mfaEnabled) {
      const challengeToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
          typ: 'mfa_challenge',
        },
        { expiresIn: '5m' }
      );

      return {
        mfaRequired: true,
        challengeToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          role: user.role,
          mfaEnabled: true,
        },
      };
    }

    const jti = crypto.randomUUID();
    const payload = {
      email: user.email,
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      jti,
      mfaVerified: false,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
        mfaEnabled: false,
      },
    };
  }

  async register(data: any) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new UnauthorizedException('Email already exists');
    }

    const user = await this.usersService.create(data);
    return this.login(user);
  }

  async logout(token: string, payload?: any) {
    if (!token && !payload?.jti) {
      return { success: true, message: 'No active session token provided' };
    }

    const sessionIdentifier = payload?.jti || token;
    let ttlSeconds = 604800; // 7 days default
    if (payload?.exp) {
      ttlSeconds = Math.max(payload.exp - Math.floor(Date.now() / 1000), 60);
    }

    await revokeSession(sessionIdentifier, ttlSeconds);
    if (token && token !== sessionIdentifier) {
      await revokeSession(token, ttlSeconds);
    }
    return { success: true, message: 'Logged out successfully and session revoked' };
  }

  // --------------------------------------------------------------------------
  // MULTI-FACTOR AUTHENTICATION (MFA / TOTP)
  // --------------------------------------------------------------------------

  async setupMfa(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const secret = generateTotpSecret(20);
    const otpauthUrl = generateOtpauthUrl(user.email, secret, 'BusinessOS');
    const { plaintextCodes, hashedCodes } = generateRecoveryCodes(8);

    // Save pending setup in Redis for 10 minutes
    const redis = getRedisClient();
    const pendingKey = `mfa_pending:${userId}`;
    await redis.set(
      pendingKey,
      JSON.stringify({ secret, hashedCodes }),
      'EX',
      600
    );

    return {
      secret,
      otpauthUrl,
      recoveryCodes: plaintextCodes,
    };
  }

  async verifyMfaSetup(userId: string, code: string) {
    const redis = getRedisClient();
    const pendingKey = `mfa_pending:${userId}`;
    const pendingDataStr = await redis.get(pendingKey);

    if (!pendingDataStr) {
      throw new BadRequestException('MFA setup session expired or not initiated');
    }

    const pending = JSON.parse(pendingDataStr);
    const isValid = verifyTotpCode(pending.secret, code);

    if (!isValid) {
      throw new UnauthorizedException('Invalid 6-digit TOTP verification code');
    }

    // Authenticated encryption of TOTP secret at rest via AES-256-GCM
    const encryptedSecret = encryptMfaSecret(pending.secret);

    // Persist verified MFA configuration with encrypted secret at rest
    await this.usersService.updateMfa(userId, {
      mfaEnabled: true,
      mfaSecret: encryptedSecret,
      mfaRecoveryCodes: JSON.stringify(pending.hashedCodes),
    });

    await redis.del(pendingKey);
    this.logger.log(`MFA successfully enabled for user ${userId}`);

    return {
      success: true,
      mfaEnabled: true,
      message: 'MFA successfully enabled and verified',
    };
  }

  async challengeMfa(challengeToken: string, code: string) {
    if (!challengeToken || !code) {
      throw new BadRequestException('Challenge token and authentication code are required');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(challengeToken);
    } catch (err: any) {
      throw new UnauthorizedException('Invalid or expired MFA challenge token');
    }

    if (payload.typ !== 'mfa_challenge') {
      throw new UnauthorizedException('Invalid token type for MFA verification');
    }

    const userId = payload.sub;
    const redis = getRedisClient();
    const attemptKey = `mfa_attempts:${userId}`;

    // Rate limiting & lockout check (Max 5 attempts per 5 minutes)
    const attempts = parseInt((await redis.get(attemptKey)) || '0', 10);
    if (attempts >= 5) {
      throw new UnauthorizedException('Too many failed MFA verification attempts. Locked for 15 minutes.');
    }

    const user = await this.usersService.findById(userId);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new UnauthorizedException('User does not have active MFA configured');
    }

    // Authenticated decryption of TOTP secret at rest using AES-256-GCM
    let decryptedSecret: string;
    try {
      decryptedSecret = resolveMfaSecret(user.mfaSecret);
    } catch (err: any) {
      this.logger.error(`Failed to decrypt MFA secret for user ${userId}: ${err.message}`);
      throw new UnauthorizedException('MFA verification failed');
    }

    let authenticated = false;

    // Check TOTP code
    if (/^\d{6}$/.test(code.trim())) {
      const isTotpValid = verifyTotpCode(decryptedSecret, code);
      if (isTotpValid) {
        // Replay prevention: atomic check-and-set via Redis SET NX
        const replayKey = `mfa_used:${userId}:${code.trim()}`;
        const setOk = await redis.set(replayKey, '1', 'EX', 60, 'NX');
        if (!setOk) {
          throw new UnauthorizedException('TOTP code already used. Please wait for the next time window.');
        }
        authenticated = true;
      }
    }

    // Check Recovery Code if TOTP didn't match
    if (!authenticated) {
      const cleanRecovery = code.trim().toUpperCase();
      const inputHash = crypto.createHash('sha256').update(cleanRecovery).digest('hex');
      const recoveryReplayKey = `mfa_used:${userId}:${inputHash}`;
      const setOk = await redis.set(recoveryReplayKey, '1', 'EX', 86400, 'NX');
      if (setOk) {
        const { valid, remainingHashedJson } = verifyAndConsumeRecoveryCode(
          cleanRecovery,
          user.mfaRecoveryCodes
        );
        if (valid) {
          await this.usersService.updateMfa(userId, {
            mfaEnabled: true,
            mfaRecoveryCodes: remainingHashedJson,
          });
          authenticated = true;
          this.logger.log(`User ${userId} authenticated using one-time backup recovery code`);
        } else {
          await redis.del(recoveryReplayKey);
        }
      } else {
        throw new UnauthorizedException('Recovery code already consumed or in use');
      }
    }

    if (!authenticated) {
      const currentAttempts = await redis.incr(attemptKey);
      if (currentAttempts === 1) {
        await redis.expire(attemptKey, 300);
      } else if (currentAttempts >= 5) {
        await redis.expire(attemptKey, 900);
      }
      throw new UnauthorizedException('Invalid MFA authentication code');
    }

    // Reset failed attempts on success
    await redis.del(attemptKey);

    // Issue fully authenticated access token
    const jti = crypto.randomUUID();
    const fullPayload = {
      email: user.email,
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      jti,
      mfaVerified: true,
    };

    return {
      access_token: this.jwtService.sign(fullPayload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        role: user.role,
        mfaEnabled: true,
      },
    };
  }

  async disableMfa(userId: string, body: { password: string; code: string }) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      throw new BadRequestException('MFA is not enabled on this account');
    }

    // Validate password
    const isMatch = await bcrypt.compare(body.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid account password');
    }

    // Authenticated decryption of TOTP secret at rest using AES-256-GCM
    let decryptedSecret: string;
    try {
      decryptedSecret = resolveMfaSecret(user.mfaSecret);
    } catch (err: any) {
      this.logger.error(`Failed to decrypt MFA secret for user ${userId}: ${err.message}`);
      throw new UnauthorizedException('MFA verification failed');
    }

    // Validate TOTP code
    const isCodeValid = verifyTotpCode(decryptedSecret, body.code);
    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.usersService.updateMfa(userId, {
      mfaEnabled: false,
      mfaSecret: null,
      mfaRecoveryCodes: null,
    });

    this.logger.log(`MFA disabled for user ${userId}`);
    return {
      success: true,
      mfaEnabled: false,
      message: 'MFA has been disabled successfully',
    };
  }
}
