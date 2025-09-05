import {
    BadRequestException,
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    ConflictException
  } from '@nestjs/common';
  import { PrismaService } from '../prisma/prisma.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { User } from '@prisma/client';
import { RoleService } from 'src/role/role.service';
import * as bcrypt from 'bcrypt';
import { CreateEmployeeUserDto } from './dto/create-employee-user.dto';
import { dot } from 'node:test/reporters';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
  
  @Injectable()
  export class UserService {
    constructor(private readonly prisma: PrismaService, private readonly roleService : RoleService) {}
  
    async create(data: CreateUserDto): Promise<User> {

      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new ConflictException('A user with this email already exists');
      }

      const role = await this.roleService.findByName(data.roleName);
      if (!role) {
        throw new NotFoundException(`Role '${data.roleName}' not found`);
      }
      const hashedPassword = await bcrypt.hash(data.password, 10); 

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword, 
          userName: data.userName,
          profileImage: data.profileImage,
        },
      });

      await this.prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      return user;
    }

    async createEmployeeUser(data: CreateEmployeeUserDto, organizationId : string) {
      try {

        const existingEmail = await this.prisma.user.findUnique({
        where: { email: data.email },
        });
        if (existingEmail) {
          throw new ConflictException('A user with this email already exists');
        }

        const role = await this.prisma.role.findUnique({where : { id : data.roleId }});
        if (!role) {
          throw new NotFoundException(`Role '${data.roleId}' not found`);
        }

        const existingEmployee  = await this.prisma.employee.findFirst({ 
          where : { 
            id : data.employeeId,
            organizationId : organizationId  
          }});

        if(!existingEmployee){
          throw new NotFoundException("employee doesn't exist for this organization");
        }  

         const existingUser  = await this.prisma.employee.findFirst({ 
          where : { 
            id : data.employeeId,
            userId : {
              not : null
            },
            organizationId : organizationId  
          }});

        if(existingUser){
          throw new NotFoundException("This employee is already a user");
        }  

        const hashedPassword = await bcrypt.hash(data.password, 10); 

        await this.prisma.$transaction(async (prisma) => {
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: hashedPassword,
              userName: data.userName,
              profileImage: data.profileImage,
            },
          });

          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: role.id,
            },
          });

          await prisma.userOffice.create({
            data: {
              userId: user.id,
              organizationId : organizationId,
              officeId: data.officeId,
            },
          });

          const updatedEmployee  = await prisma.employee.update({
            where: { id: data.employeeId },
            data: { userId: user.id },
          });

          return {user, employee : updatedEmployee};
        });
        
      } catch (error) {
        handlePrismaError(error);
      }
    }

  
    async findAll(): Promise<User[]> {
      try {
        return this.prisma.user.findMany({
            include: {
              userRoles: {
                include: {
                  role: true,
                },
              },
            },
          });
      } catch (error) {
        throw new InternalServerErrorException('Failed to fetch users', { cause: error });
      }  
    }
  
    async findOne(id: string): Promise<User> {
      try {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
              userRoles: {
                include: { role: true },
              },
            },
          });
      
          if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
          }
      
          return user;
      } catch (error) {
        throw new InternalServerErrorException('Failed to fetch users', { cause: error });
      }  
    }
  
    async remove(id: string): Promise<User> {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    
        return this.prisma.user.delete({ where: { id } });
    }

    async findByEmail(email: string): Promise<any | null> {
      return this.prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    }
  }
  