/* eslint-disable @typescript-eslint/no-require-imports */
import { SignupDto } from '@api/auth/dto';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginDto } from '../../src/api/auth/dto/login.dto';
import { Role } from '../../src/domain/auth/enums/role.enum';
import { JwtService } from '@application/auth/jwt/jwt.service';
import { AuthService } from '../../src/application/auth/auth.service';
import { CryptoService } from '@application/auth/crypto/crypto.service';
import { UsersService } from '../../src/application/users/users.service';
import { UserAlreadyExistsError, UserNotAuthorizedError } from '../../src/domain/exceptions';
import { UserEntity } from '@domain/users/entities/user.entity';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let cryptoService: CryptoService;

  const mockUser = {
    id: '4a736f64-616c-69-6173-696f6e',
    email: 'test@example.com',
    role: Role.CUSTOMER,
    age: 25,
  };

  const mockManagerUser = {
    id: '4a736f64-616c-69-6173-696f6e',
    email: 'manager@example.com',
    role: Role.MANAGER,
    age: 30,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmailWithPassword: jest.fn(),
            findByEmail: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            encrypt: jest.fn(),
            decrypt: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    cryptoService = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    beforeEach(() => {
      jest.spyOn(require('bcrypt'), 'compare');
    });

    it('should return user data without password when credentials are valid', async () => {
      const userWithPassword = { ...mockUser, password: 'valid-hashed-password' };
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue(userWithPassword);
      (require('bcrypt').compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(mockUser.email, 'valid-password');

      expect(result).toEqual(mockUser);
      expect(require('bcrypt').compare).toHaveBeenCalledWith('valid-password', 'valid-hashed-password');
    });

    it('should throw UserNotAuthorizedError when credentials are invalid', async () => {
      (usersService.findByEmailWithPassword as jest.Mock).mockResolvedValue({ password: 'hashed-password' });
      (require('bcrypt').compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.validateUser('email@example.com', 'wrong-password')).rejects.toThrow(UserNotAuthorizedError);
    });
  });

  describe('encrpytUserClaims', () => {
    it('should encrypt user claims', async () => {
      const cipherText = 'cipherText';
      jest.spyOn(cryptoService, 'encrypt').mockResolvedValue(cipherText);
      const result = await authService.encrpytUserClaims(mockUser as UserEntity);

      expect(cryptoService.encrypt).toHaveBeenCalledWith({ ...mockUser, sub: mockUser.id });
      expect(result).toEqual(cipherText);
    });

    it('should decrypt user claims', async () => {
      const cipherText = 'cipherText';
      jest.spyOn(cryptoService, 'decrypt').mockResolvedValue(mockUser);
      const result = await cryptoService.decrypt(cipherText);

      expect(cryptoService.decrypt).toHaveBeenCalledWith(cipherText);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = { email: mockUser.email, password: 'password' };

    it('should return JWT token when login is successful', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(mockUser);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('jwtToken');
      const cipherText = await cryptoService.encrypt(mockUser);

      const result = await authService.login(loginDto);

      expect(result).toEqual({ access_token: 'jwtToken' });
      expect(jwtService.signAsync).toHaveBeenCalledWith(cipherText);
    });

    it('should propagate UserNotAuthorizedError from validateUser', async () => {
      jest.spyOn(authService, 'validateUser').mockRejectedValue(new UserNotAuthorizedError());

      await expect(authService.login(loginDto)).rejects.toThrow(UserNotAuthorizedError);
    });
  });

  describe('signup', () => {
    const baseSignupDto = {
      email: mockUser.email,
      password: 'password',
      username: 'TestUser',
      age: 25,
    };

    const testSignup = async (role: Role) => {
      const signupDto: SignupDto = { ...baseSignupDto, role };
      const expectedUser = role === Role.MANAGER ? mockManagerUser : mockUser;

      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.createUser as jest.Mock).mockResolvedValue(expectedUser);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('jwtToken');

      const result = await authService.signup(signupDto);

      expect(result).toEqual({ access_token: 'jwtToken', user: expectedUser });
      expect(usersService.createUser).toHaveBeenCalledWith(signupDto);
    };

    it('should create customer account and return JWT token', () => testSignup(Role.CUSTOMER));
    it('should create manager account and return JWT token', () => testSignup(Role.MANAGER));

    it('should throw UserAlreadyExistsError when email exists', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.signup({ ...baseSignupDto, role: Role.CUSTOMER })).rejects.toThrow(UserAlreadyExistsError);
    });

    it('should propagate unexpected errors', async () => {
      (usersService.findByEmail as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(authService.signup({ ...baseSignupDto, role: Role.CUSTOMER })).rejects.toThrow('Database error');
    });
  });
});
