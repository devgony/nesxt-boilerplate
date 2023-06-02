import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int, { nullable: false })
  id!: number;

  @Field(() => Date, { nullable: false })
  @CreateDateColumn()
  created_at!: Date;

  @Field(() => Date, { nullable: false })
  @UpdateDateColumn()
  updated_at!: Date;
}
