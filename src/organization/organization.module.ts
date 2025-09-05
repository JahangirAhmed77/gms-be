import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { UserService } from 'src/user/user.service';
import { RoleService } from 'src/role/role.service';

@Module({
  providers: [OrganizationService,UserService,RoleService],
  controllers: [OrganizationController]
})
export class OrganizationModule {}
