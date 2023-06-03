import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import {
  CreateAccountInput,
  CreateAccountOutput,
} from "./dtos/create-account.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { AccountsService } from "./accounts.service";

@Resolver()
export class AccountsResolver {
  constructor(private readonly AccountService: AccountsService) {}

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args("input") createAccountInput: CreateAccountInput
  ): Promise<CreateAccountOutput> {
    return this.AccountService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args("input") loginInput: LoginInput): Promise<LoginOutput> {
    return this.AccountService.login(loginInput);
  }

  @Query(() => Boolean)
  test(): boolean {
    return true;
  }
}
