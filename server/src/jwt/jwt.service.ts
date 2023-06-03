import * as jwt from "jsonwebtoken";
import { Inject, Injectable } from "@nestjs/common";
import { JwtModuleOptions } from "./jwt.interfaces";
import { CONFIG_OPTIONS } from "../common/common.constants";

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions // we can inject whatever
  ) {}
  sign(AccountId: number): string {
    return jwt.sign({ id: AccountId }, this.options.privateKey);
  }
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
