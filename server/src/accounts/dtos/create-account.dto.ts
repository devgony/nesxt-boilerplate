import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { ResultOutput } from "../../common/dtos/result.dto";
import { Account } from "../entities/account.entity";

@InputType()
export class CreateAccountInput extends PickType(Account, [
  "name",
  "password",
]) {}

@ObjectType()
export class CreateAccountOutput extends ResultOutput {}
