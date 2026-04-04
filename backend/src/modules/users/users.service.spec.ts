import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  const mockUserModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return users without passwords', async () => {
    const mockExec = jest.fn().mockResolvedValue([{ email: 'test@test.com' }]);
    const mockSelect = jest.fn().mockReturnValue({ exec: mockExec });
    mockUserModel.find.mockReturnValue({ select: mockSelect });

    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(mockUserModel.find).toHaveBeenCalled();
    expect(mockSelect).toHaveBeenCalledWith('-passwordHash -refreshToken');
  });

  it('findByEmail should query with lowercase email', async () => {
    const mockExec = jest.fn().mockResolvedValue({ email: 'test@test.com' });
    mockUserModel.findOne.mockReturnValue({ exec: mockExec });

    await service.findByEmail('TEST@TEST.COM');
    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      email: 'test@test.com',
    });
  });

  it('findById should throw NotFoundException for non-existent user', async () => {
    const mockExec = jest.fn().mockResolvedValue(null);
    const mockSelect = jest.fn().mockReturnValue({ exec: mockExec });
    mockUserModel.findById.mockReturnValue({ select: mockSelect });

    await expect(service.findById('invalid-id')).rejects.toThrow(
      'User not found',
    );
  });

  it('updateRefreshToken should call findByIdAndUpdate', async () => {
    const mockExec = jest.fn().mockResolvedValue({});
    mockUserModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

    await service.updateRefreshToken('user-id', 'token-123');
    expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-id',
      expect.objectContaining({ refreshToken: expect.any(String) }),
    );
  });
});
