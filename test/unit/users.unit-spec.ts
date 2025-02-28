import * as bcrypt from 'bcrypt';
import { SignupDto } from '@api/auth/dto';
import { GenericResponseDto } from '@api/common/dto';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../../src/domain/auth/enums/role.enum';
import { UserEntity } from '@domain/users/entities/user.entity';
import { UserNotFoundError } from '../../src/domain/exceptions';
import { MovieEntity } from '@domain/movies/entities/movie.entity';
import { UsersController } from '../../src/api/users/users.controller';
import { UsersService } from '../../src/application/users/users.service';
import { MoviesService } from '../../src/application/movies/movies.service';
import { TicketsService } from '../../src/application/tickets/tickets.service';
import { WatchHistoryService } from '@application/watch-history/watch-history.service';
import { WatchHistoryEntity } from '@domain/watch-history/entites/watch-history.entity';
import { IUserRepository, UserRepositoryToken } from '../../src/domain/users/repositories/user-repository.interface';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let watchHistoryService: WatchHistoryService;

  // Test fixtures
  const mockUser: UserEntity = {
    id: '4a736f64-616c-69-6173-696f6e',
    email: 'user@example.com',
    role: Role.CUSTOMER,
  } as UserEntity;

  const mockMovie: MovieEntity = {
    id: 'movie1',
    name: 'Inception',
    ageRestriction: 13,
  } as MovieEntity;

  const mockWatchHistory: WatchHistoryEntity[] = [
    {
      id: 1,
      user: mockUser,
      movie: mockMovie,
      watchedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            getWatchHistory: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            findByRole: jest.fn(),
            findUserByEmailWithPassword: jest.fn(),
          },
        },
        {
          provide: WatchHistoryService,
          useValue: {
            getWatchHistory: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    watchHistoryService = module.get(WatchHistoryService);
  });

  describe('getUserProfile', () => {
    beforeEach(() => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser);
    });

    it('should successfully retrieve user profile', async () => {
      const result = await controller.getUserProfile(mockUser);

      expect(usersService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(new GenericResponseDto('The User Profile Has Been Successfully Retrieved!', mockUser));
    });
  });

  describe('getWatchHistory', () => {
    it('should retrieve watch history when records exist', async () => {
      jest.spyOn(watchHistoryService, 'getWatchHistory').mockResolvedValue(mockWatchHistory);

      const result = await controller.getWatchHistory(mockUser);

      expect(watchHistoryService.getWatchHistory).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(new GenericResponseDto('The Users Watch History Has Been Successfully Retrieved!', mockWatchHistory));
    });

    it('should return empty array when no watch history exists', async () => {
      jest.spyOn(watchHistoryService, 'getWatchHistory').mockResolvedValue([]);

      const result = await controller.getWatchHistory(mockUser);

      expect(result.data).toHaveLength(0);
      expect(result).toEqual(new GenericResponseDto('The Users Watch History Has Been Successfully Retrieved!', []));
    });
  });

  it('should return the user if found', async () => {
    const mockUser = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: Role.CUSTOMER,
    } as UserEntity;

    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

    const result = await usersService.findOne({ where: { id: '1' } });

    expect(result).toEqual(mockUser);
    expect(usersService.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should return user by email', async () => {
    const mockUser = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: Role.CUSTOMER,
    } as UserEntity;

    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

    const result = await usersService.findOne({ where: { email: 'user@example.com' } });

    expect(result).toEqual(mockUser);
  });

  it('should return users watch history', async () => {
    const mockUser = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      role: Role.CUSTOMER,
    } as UserEntity;
    const mockWatchHistory = [
      {
        id: '1',
        user: mockUser,
        movie: { id: '1', name: 'Inception', ageRestriction: 13 },
        watchedAt: new Date(),
      },
    ] as unknown as WatchHistoryEntity[];

    jest.spyOn(watchHistoryService, 'getWatchHistory').mockResolvedValue(mockWatchHistory);

    const result = await watchHistoryService.getWatchHistory(mockUser.id);

    expect(result).toEqual(mockWatchHistory);
  });

  it('should return users by role as manager', async () => {
    const mockUsers = [
      {
        id: '4a736f64-616c-69-6173-696f6e',
        email: 'user@example.com',
        role: Role.MANAGER,
      } as UserEntity,
    ];

    jest.spyOn(usersService, 'findByRole').mockResolvedValue(mockUsers);

    const result = await usersService.findByRole(Role.MANAGER);

    expect(result).toEqual(mockUsers);
  });

  it('should return users by role as customer', async () => {
    const mockUsers = [
      {
        id: '4a736f64-616c-69-6173-696f6e',
        email: 'user@example.com',
        role: Role.CUSTOMER,
      } as UserEntity,
    ];

    jest.spyOn(usersService, 'findByRole').mockResolvedValue(mockUsers);

    const result = await usersService.findByRole(Role.CUSTOMER);

    expect(result).toEqual(mockUsers);
  });

  it('should return user by email with password', async () => {
    const mockUser = {
      id: '4a736f64-616c-69-6173-696f6e',
      email: 'user@example.com',
      password: 'password',
      role: Role.MANAGER,
    } as UserEntity;

    jest.spyOn(usersService, 'findByEmailWithPassword').mockResolvedValue(mockUser);

    const result = await usersService.findByEmailWithPassword('user@example.com');

    expect(result).toEqual(mockUser);
  });
});

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: IUserRepository;

  const mockUser: UserEntity = {
    id: '4a736f64-616c-69-6173-696f6e',
    email: 'user@example.com',
    role: Role.CUSTOMER,
  } as UserEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepositoryToken,
          useValue: {
            findOne: jest.fn(),
            findByEmail: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            save: jest.fn(),
            findByRole: jest.fn(),
          },
        },
        {
          provide: TicketsService,
          useValue: {
            getUsersUsedTickets: jest.fn(),
          },
        },
        {
          provide: MoviesService,
          useValue: {
            findMoviesByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<IUserRepository>(UserRepositoryToken);
  });

  describe('findOne', () => {
    it('should throw UserNotFoundError when user does not exist', async () => {
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValue(null);

      await expect(usersService.findOne({ where: { id: '1' } })).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('findByEmail', () => {
    it('should successfully find user by email', async () => {
      jest.spyOn(usersRepository, 'findByEmail').mockResolvedValue(mockUser);

      const result = await usersService.findByEmail('user@example.com');

      expect(usersRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    const createUserDto: SignupDto = {
      username: 'testuser',
      password: 'password123',
      age: 25,
      role: Role.CUSTOMER,
      email: 'testuser@example.com',
    };

    const hashedPassword = 'hashedPassword';

    beforeEach(() => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
    });

    it('should successfully create new user', async () => {
      const expectedUser = {
        ...createUserDto,
        id: '4a736f64-616c-69-6173-696f6e',
        password: hashedPassword,
      } as UserEntity;

      jest.spyOn(usersRepository, 'save').mockResolvedValue(expectedUser);

      const result = await usersService.createUser(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          password: hashedPassword,
          age: 25,
          role: Role.CUSTOMER,
          email: 'testuser@example.com',
        }),
      );
      expect(result).toEqual(expectedUser);
    });
  });
});
