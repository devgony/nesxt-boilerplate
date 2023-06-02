import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ResultOutput {
  @Field(() => Boolean, { nullable: true })
  ok!: boolean;
  @Field(() => String, { nullable: true })
  error?: string;
}
