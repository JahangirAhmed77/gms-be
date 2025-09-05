import {
    Injectable,
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { Role } from '@prisma/client';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { RolesEnum } from 'src/common/enums/roles-enum';
  
  @Injectable()
  export class RoleService {
    constructor(private prisma: PrismaService) {}
  
    async create(roleName: string): Promise<Role> {
        return await this.prisma.role.create({
          data: { roleName },
        });
    }
  
    async findAll(){
      try {
        return await this.prisma.role.findMany({});
      } catch (error) {
        handlePrismaError(error)
      }
    }

    async findForOrganization(){
      try {
        return await this.prisma.role.findMany({
          where: {
            roleName: {
              notIn: [RolesEnum.superAdmin, RolesEnum.organizationAdmin, RolesEnum.guard, RolesEnum.client],
            },
          },
        });
      } catch (error) {
        handlePrismaError(error)
      }
    }
  
    async findOne(id: string): Promise<Role> {
      try {
        const role = await this.prisma.role.findUnique({ where: { id } });
        if (!role) {
          throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Failed to fetch role', { cause: error });
      }
    }
    
    async findByName(roleName: string): Promise<Role | null> {
        return this.prisma.role.findFirst({
          where: { roleName },
        });
    }
  
    async update(id: string, roleName?: string): Promise<Role> {
      try {
        const existing = await this.prisma.role.findUnique({ where: { id } });
        if (!existing) {
          throw new NotFoundException(`Role with ID ${id} not found`);
        }
  
        return await this.prisma.role.update({
          where: { id },
          data: {
            ...(roleName && { roleName }),
          },
        });
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Failed to update role', { cause: error });
      }
    }
  
    async remove(id: string): Promise<Role> {
      try {
        const existing = await this.prisma.role.findUnique({ where: { id } });
        if (!existing) {
          throw new NotFoundException(`Role with ID ${id} not found`);
        }
  
        return await this.prisma.role.delete({ where: { id } });
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Failed to delete role', { cause: error });
      }
    }
  }
  