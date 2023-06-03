import { Test, TestingModule } from "@nestjs/testing";
import { AccountsService } from "./accounts.service";
import { ObjectLiteral, Repository } from "typeorm";
import { Account } from "./entities/account.entity";
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

describe("AccountsService", () => {
  let service: AccountsService;
  let accountsRepository: MockRepository<Account>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    accountsRepository = module.get(getRepositoryToken(Account));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createAccount", () => {
    const createAccountArgs = {
      name: "test",
      password: "1234",
    };
    it("should fail if account exists", async () => {
      accountsRepository.findOne?.mockResolvedValue({
        id: 1,
        ...createAccountArgs,
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: "Account already exists",
      });
    });
    it("should create a new account", async () => {
      accountsRepository.findOne?.mockResolvedValue(undefined);
      accountsRepository.create?.mockReturnValue(createAccountArgs);
      accountsRepository.save?.mockResolvedValue(createAccountArgs);
      const result = await service.createAccount(createAccountArgs);
      expect(accountsRepository.create).toHaveBeenCalledTimes(1);
      expect(accountsRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(accountsRepository.save).toHaveBeenCalledTimes(1);
      expect(accountsRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(result).toEqual({ ok: true });
    });
    it("should fail on exception", async () => {
      accountsRepository.findOne?.mockRejectedValue(new Error(":!@#"));
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Could not create account" });
    });
  });

  describe("login", () => {
    const loginArgs = {
      name: "test",
      password: "1234",
    };
    it("should fail if account does not exist", async () => {
      accountsRepository.findOne?.mockResolvedValue(undefined);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: "Could not find account",
      });
    });
    it("should fail if the password is wrong", async () => {
      const mockedAccount = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      accountsRepository.findOne?.mockResolvedValue(mockedAccount);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Wrong password" });
    });
    it("should return token if password correct", async () => {
      const mockedAccount = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      accountsRepository.findOne?.mockResolvedValue(mockedAccount);
      const result = await service.login(loginArgs);
      expect(accountsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(accountsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(result).toEqual({ ok: true, token: "superpass-signed-token" });
    });
    it("should fail on exception", async () => {
      accountsRepository.findOne?.mockRejectedValue(new Error(":!@#"));
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Could not login" });
    });
  });
});
