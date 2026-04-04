import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;

  const mockUser = {
    _id: 'user-id-123',
    email: 'admin@test.com',
    passwordHash: '',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isActive: true,
  };

  beforeEach(async () => {
    mockUser.passwordHash = await bcrypt.hash('password123', 10);

    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateRefreshToken: jest.fn(),
      updateLastLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn().mockReturnValue({ sub: 'user-id-123' }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('15m'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login should return tokens for valid credentials', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    const result = await service.login('admin@test.com', 'password123');

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe('admin@test.com');
    expect(result.user.role).toBe('admin');
    expect(usersService.updateRefreshToken).toHaveBeenCalled();
    expect(usersService.updateLastLogin).toHaveBeenCalled();
  });

  it('login should throw for invalid email', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(service.login('bad@email.com', 'password')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('login should throw for wrong password', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    await expect(
      service.login('admin@test.com', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should throw for inactive user', async () => {
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      ...mockUser,
      isActive: false,
    });

    await expect(
      service.login('admin@test.com', 'password123'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('logout should clear refresh token', async () => {
    const result = await service.logout('user-id-123');
    expect(result).toEqual({ message: 'Logged out successfully' });
    expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
      'user-id-123',
      null,
    );
  });
});
