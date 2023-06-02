import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { ObjectLiteral, Repository } from "typeorm";
import { User } from "./entities/users.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "../jwt/jwt.service";

const mockRepository = <T extends ObjectLiteral>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => "superpass-signed-token"),
  verify: jest.fn(),
});

type MockRepository<T extends ObjectLiteral> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe("UsersService", () => {
  let service: UsersService;
  let usersRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createUser", () => {
    const createUserArgs = {
      username: "test",
      password: "1234",
    };
    it("should fail if user exists", async () => {
      usersRepository.findOne?.mockResolvedValue({
        id: 1,
        ...createUserArgs,
      });
      const result = await service.createUser(createUserArgs);
      expect(result).toMatchObject({
        ok: false,
        error: "User already exists",
      });
    });
    it("should create a new user", async () => {
      usersRepository.findOne?.mockResolvedValue(undefined);
      usersRepository.create?.mockReturnValue(createUserArgs);
      usersRepository.save?.mockResolvedValue(createUserArgs);
      const result = await service.createUser(createUserArgs);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createUserArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createUserArgs);
      expect(result).toEqual({ ok: true });
    });
    it("should fail on exception", async () => {
      usersRepository.findOne?.mockRejectedValue(new Error(":!@#"));
      const result = await service.createUser(createUserArgs);
      expect(result).toEqual({ ok: false, error: "Could not create user" });
    });
  });

  describe("login", () => {
    const loginArgs = {
      username: "test",
      password: "1234",
    };
    it("should fail if user does not exist", async () => {
      usersRepository.findOne?.mockResolvedValue(undefined);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: "Could not find user",
      });
    });
    it("should fail if the password is wrong", async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne?.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Wrong password" });
    });
    it("should return token if password correct", async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne?.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ ok: true, token: "superpass-signed-token" });
    });
    it("should fail on exception", async () => {
      usersRepository.findOne?.mockRejectedValue(new Error(":!@#"));
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Could not login" });
    });
  });
});
