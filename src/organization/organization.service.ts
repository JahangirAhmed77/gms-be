import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
    ConflictException,
  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UserService } from 'src/user/user.service';
import { CreateOfficeDto } from './dto/create-office-dto';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { generateRandomNumber } from 'src/common/utils/random-num-generator';
import { CreateOrganizationBankAccountDto } from './dto/create-bank-account.dto';
  
  @Injectable()
  export class OrganizationService {
    constructor(private prisma: PrismaService, private userService : UserService) {}
  
    async create(dto: CreateOrganizationDto) {
        try {
          const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
          });
          if (existingUser) {
            throw new ConflictException('An user with this email already exists');
          }

          const user = await this.userService.create({
            email: dto.email,
            password: dto.password,
            userName: dto.userName,
            roleName: 'organizationAdmin',
          });
      
          const organization = await this.prisma.organization.create({
            data: {
              organizationName: dto.organizationName,
              userId: user.id,
            },
          });
      
          return {
              organization,
              admin: {
                id: user.id,
                email: user.email,
                userName: user.userName,
              },
          };
        } catch (error) {
          handlePrismaError(error);
        }
      }

    
    async addOffice(dto: CreateOfficeDto, organizationId : string) {
        try {
          const organization = await this.prisma.organization.findUnique({
            where : {id : organizationId}
          });

          if(!organization) throw new NotFoundException("organization doesnt' exist");

          const existingBranchName = await this.prisma.office.findFirst({ where : { organizationId : organizationId, branchName : dto.branchName } });
          const existingEmail = await this.prisma.office.findFirst({ where : { organizationId : organizationId, email : dto.email } });
          const existingContactNumber = await this.prisma.office.findFirst({ where : { organizationId : organizationId, contactNumber : dto.contactNumber } });
          const existingAddress = await this.prisma.office.findFirst({ where : { organizationId : organizationId, address : dto.address } });

          if(existingBranchName) throw new ConflictException("office with given branch name already exists"); 
          if(existingEmail) throw new ConflictException("office with given email name already exists"); 
          if(existingContactNumber) throw new ConflictException("office with given contact number already exists"); 
          if(existingAddress) throw new ConflictException("office with given address already exists"); 

          const branchCode = generateRandomNumber(4);  

          return await this.prisma.office.create({
            data: {
              ...dto,
              organizationId,
              branchCode
            },
            include :{
              organization : true
            }
          });
      
        } catch (error) {
          handlePrismaError(error);
        }
      }


      async addBankAccount(dto: CreateOrganizationBankAccountDto, organizationId : string) {
        try {
          const organization = await this.prisma.organization.findUnique({
            where : {id : organizationId}
          });

          if(!organization) throw new NotFoundException("organization doesnt' exist");

          const existingAccountNumber = await this.prisma.organizationBankAccount.findFirst({ where : {  accountNumber : dto.accountNumber } });
          const existingIBAN = await this.prisma.organizationBankAccount.findFirst({ where : { IBAN : dto.IBAN } });

          if(existingAccountNumber) throw new ConflictException("Bank Account with given account number already exists"); 
          if(existingIBAN) throw new ConflictException("Bank Account with given IBAN already exists"); 

          return await this.prisma.organizationBankAccount.create({
            data: {
              ...dto,
              organizationId,
            },
            include :{
              organization : true
            }
          });
      
        } catch (error) {
          handlePrismaError(error);
        }
      }


    async getOffices(organizationId : string) {
        try {
          const organization = await this.prisma.organization.findUnique({
            where : {id : organizationId}
          });

          if(!organization){
            throw new NotFoundException("organization doesnt' exist");
          }

          return await this.prisma.office.findMany({
            where : { organizationId : organizationId },
            include : {
              organization : true
            }
          });
      
        } catch (error) {
          handlePrismaError(error);
        }
      }
      
    

    async getAllBankAccounts(organizationId : string) {
        try {
          const organization = await this.prisma.organization.findUnique({
            where : {id : organizationId}
          });

          if(!organization){
            throw new NotFoundException("organization doesnt' exist");
          }

          return await this.prisma.organizationBankAccount.findMany({
            where : { organizationId : organizationId },
          });
      
        } catch (error) {
          handlePrismaError(error);
        }
      }  

      
    
    async deleteOffice(officeId : string, organizationId : string) {
        try {
          const organization = await this.prisma.organization.findUnique({
            where : {id : organizationId}
          });

          const office = await this.prisma.office.findUnique({
            where : {
              id : officeId,
              organizationId : organizationId
            }
          });

          if(!organization) throw new NotFoundException("organization doesnt' exist");
          if(!office) throw new NotFoundException("organization doesnt' exist");
      
          return await this.prisma.office.delete({
            where : {
              id : officeId,
              organizationId : organizationId
            }
          });
      
        } catch (error) {
          handlePrismaError(error);
        }
    }  
    
      
      
  
    async findAll() {
      try {
        return await this.prisma.organization.findMany({
          include: {
            user: true,
            employee: true,
          },
        });
      } catch (error) {
        throw new InternalServerErrorException('Failed to fetch organizations', { cause: error });
      }
    }
  
    async findOne(id: string) {
      try {
        const org = await this.prisma.organization.findUnique({
          where: { id },
          include: { user: true, employee: true },
        });
        if (!org) throw new NotFoundException(`Organization with ID ${id} not found`);
        return org;
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException('Failed to fetch organization', { cause: error });
      }
    }
  
    async update(id: string, dto: UpdateOrganizationDto) {
      try {
        const existing = await this.prisma.organization.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Organization with ID ${id} not found`);

        const { office, ...rest } = dto;

        const updatedOrganization = await this.prisma.organization.update({
          where: { id },
          data: rest,
        });

        if (office && office.length > 0) {
          for (const o of office) {
            await this.prisma.office.create({
              data: {
                ...o,
                organization: { connect: { id } },
              },
            });
          }
        }

        return updatedOrganization;

      } catch (error) {
        throw new InternalServerErrorException('Failed to update organization', { cause: error });
      }
    }
  
    async remove(id: string) {
      try {
        const existing = await this.prisma.organization.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException(`Organization with ID ${id} not found`);
  
        return await this.prisma.organization.delete({ where: { id } });
      } catch (error) {
        throw new InternalServerErrorException('Failed to delete organization', { cause: error });
      }
    }
  }
  