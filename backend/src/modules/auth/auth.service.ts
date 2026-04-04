import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = {
      sub: String(user._id),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (this.configService.get<string>('jwt.accessExpiration') ||
        '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: (this.configService.get<string>('jwt.refreshExpiration') ||
        '7d') as any,
    });

    // Save refresh token hash
    await this.usersService.updateRefreshToken(String(user._id), refreshToken);

    // Update last login
    await this.usersService.updateLastLogin(String(user._id));

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (!user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Support both legacy plain token and current hashed token storage.
      const isTokenValid = user.refreshToken.startsWith('$2')
        ? await bcrypt.compare(refreshToken, user.refreshToken)
        : user.refreshToken === refreshToken;

      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = {
        sub: String(user._id),
        email: user.email,
        role: user.role,
      };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: (this.configService.get<string>('jwt.accessExpiration') ||
          '15m') as any,
      });

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}
