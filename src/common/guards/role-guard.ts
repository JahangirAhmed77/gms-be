// roles.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { ROLES_KEY } from '../decorators/role.decorator';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(
      private reflector: Reflector,
      private prisma: PrismaService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (!requiredRoles?.length) return true;
  
      const { user } = context.switchToHttp().getRequest();
  
      if (!user?.userId || !user?.roleId) {
        throw new ForbiddenException('Missing user or roleId in token');
      }
  
      const userRole = await this.prisma.userRole.findFirst({
        where: {
          userId: user.userId,
          roleId: user.roleId, 
        },
        include: { role: true },
      });
  
      const actualRole = userRole?.role?.roleName;
      if (!actualRole || !requiredRoles.includes(actualRole)) {
        throw new ForbiddenException(
          `Access denied. Required role(s): ${requiredRoles.join(', ')}`
        );
      }
  
      return true;
    }
  }
  