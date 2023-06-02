import * as bcrypt from "bcrypt";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
// import { errLog } from 'src/common/hooks/errLog';
import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm";
import { InternalServerErrorException } from "@nestjs/common";
import { errLog } from "src/common/hooks/errLog";

@InputType("UserEntity", { isAbstract: true }) // to get input as InputType
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(() => String, { nullable: false })
  @Column({ unique: true, nullable: false })
  username: string;

  @Field(() => String, { nullable: false })
  @Column({ nullable: false })
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        errLog(__filename, e);
        throw new InternalServerErrorException(); // for the case of "Couldn't create account"
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      errLog(__filename, e);
      throw new InternalServerErrorException();
    }
  }
}
