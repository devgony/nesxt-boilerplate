import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { errLog } from "../common/hooks/errLog";
import { JwtService } from "../jwt/jwt.service";
import { Repository } from "typeorm";
import { CreateUserInput, CreateUserOutput } from "./dtos/create-user.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/users.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService // private readonly config: ConfigService, // private readonly mailService: MailService,
  ) {}

  async createUser({
    username,
    password,
  }: CreateUserInput): Promise<CreateUserOutput> {
    try {
      const exists = await this.users.findOne({ where: { username } });
      if (exists) {
        return { ok: false, error: "User already exists" };
      }
      const user = await this.users.save(
        this.users.create({ username, password })
      );
      return { ok: true };
    } catch (error) {
      errLog(__filename, error);
      return { ok: false, error: "Could not create user" };
    }
  }

  async login({ username, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { username },
        select: ["id"],
      });
      if (!user) {
        return { ok: false, error: "Could not find user" };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return { ok: false, error: "Wrong password" };
      }
      const token = this.jwtService.sign(user.id);
      return { ok: true, token };
    } catch (error) {
      errLog(__filename, error);
      return { ok: false, error: "Could not login" };
    }
  }
}
