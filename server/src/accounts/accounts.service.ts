import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { errLog } from "../common/hooks/errLog";
import { JwtService } from "../jwt/jwt.service";
import { Repository } from "typeorm";
import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { Account } from "./entities/account.entity";

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
    private readonly jwtService: JwtService
  ) {}

  async createAccount({
    name,
    password,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.accounts.findOne({ where: { name } });
      if (exists) {
        return { ok: false, error: "Account already exists" };
      }
      const account = await this.accounts.save(
        this.accounts.create({ name, password })
      );
      return { ok: true };
    } catch (error) {
      errLog(__filename, error);
      return { ok: false, error: "Could not create account" };
    }
  }

  async login({ name, password }: LoginInput): Promise<LoginOutput> {
    try {
      const account = await this.accounts.findOne({
        where: { name },
        select: ["id", "password"],
      });
      if (!account) {
        return { ok: false, error: "Could not find account" };
      }
      const passwordCorrect = await account.checkPassword(password);
      if (!passwordCorrect) {
        return { ok: false, error: "Wrong password" };
      }
      const token = this.jwtService.sign(account.id);
      return { ok: true, token };
    } catch (error) {
      errLog(__filename, error);
      return { ok: false, error: "Could not login" };
    }
  }
}
