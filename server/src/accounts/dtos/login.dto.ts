import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { ResultOutput } from "../../common/dtos/result.dto";
import { Account } from "../entities/account.entity";

@InputType()
export class LoginInput extends PickType(Account, ["name", "password"]) {}

@ObjectType()
export class LoginOutput extends ResultOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
