import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RoleService } from 'src/role/role.service';

@Module({
  controllers: [UserController],
  providers: [UserService, RoleService]
})
export class UserModule {}
