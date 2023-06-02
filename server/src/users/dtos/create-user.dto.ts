import { InputType, ObjectType, PickType } from "@nestjs/graphql";
import { ResultOutput } from "src/common/dtos/result.dto";
import { User } from "../entities/users.entity";

@InputType() // to use mapped type
export class CreateUserInput extends PickType(User, ["username", "password"]) {}

@ObjectType()
export class CreateUserOutput extends ResultOutput {}
