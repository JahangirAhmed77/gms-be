import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateClientDto, organizationId: string) {
    try {
        let contractNumber = data.contractNumber;
        if(!contractNumber){
          const lastClient = await this.prisma.client.findFirst({
              where: { organizationId },
              orderBy: { contractNumber: 'desc' },
          });
          contractNumber = lastClient ? lastClient.contractNumber + 1 : 1;
        }

        const { contractNumber: _, ...clientData } = data;

        const existingUser = await this.prisma.client.findUnique({
          where: { officialEmail: data.officialEmail },
        });
        if (existingUser) {
            throw new ConflictException('A client with this office email already exists');
        }
          
        return await this.prisma.client.create({
        data: {
          ...clientData,
          contractNumber,
          organizationId,
      },
        include: {
            organization: true,
        },
      });
    } catch (error) {
      handlePrismaError(error); 
    }
  }
  

  findAll() {
    return this.prisma.client.findMany({
        include: {
            organization: true,
        },
    });
  }
  

  findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        organization: true,
        location : {
          include : {
            assignedGuard : {
              where : {
                deploymentTill : null,
              },
              select : {
                deploymentDate : true,
                deploymentTill : true,
                guardCategory : {
                  select :{
                    categoryName : true  
                  }
                },
                guard : {}
              }
            }
          }
        },
      },
    });
  }

  findClientByOrganizationId(organizationId: string) {
    return this.prisma.client.findMany({
      where: { organizationId : organizationId },
      include: {
        organization: true,
        location : true
      },
    });
  }
  

  async update(id: string, data: UpdateClientDto) {
    try {
        const isExist = await this.prisma.client.findUnique({ where: { id } });
        if(!isExist){
            throw new NotFoundException("client doesn't exist");
        }
        return this.prisma.client.update({ where : {id} , data })
    } catch (error) {
        handlePrismaError(error);
    }
  }
  

  async remove(id: string) {
    try {
        const isExist  = await this.prisma.client.findFirst({ where: { id } });
        if(!isExist){
            throw new NotFoundException("client doesn't exist");
        }
        return this.prisma.client.delete({ where: { id } });
    } catch (error) {
        handlePrismaError(error)
    }
  }
}
