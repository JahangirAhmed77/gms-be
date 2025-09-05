import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuardCategoryDto } from './dto/create-guard-category.dto';
import { UpdateGuardCategoryDto } from './dto/update-guard-category.dto';
import { GetOrganizationId } from 'src/common/decorators/get-organization-Id.decorator';
import { handlePrismaError } from 'src/common/utils/prisma-error-handler';

@Injectable()
export class GuardCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateGuardCategoryDto, organizationId: string) {
    try {
      const guardCategory = await this.prisma.guardCategory.findFirst({
        where : { 
          organizationId : organizationId,
          categoryName : dto.categoryName 
        }});

      if(guardCategory){
        throw new ConflictException("this category already exist");
      }
      return this.prisma.guardCategory.create({ data: {...dto, organizationId} });
    } catch (error) {
      handlePrismaError(error)
    }
  }

  findAll() {
    return this.prisma.guardCategory.findMany();
  }

  findAllByOrganizationId(organizationId : string) {
    return this.prisma.guardCategory.findMany({ where : {organizationId : organizationId}});
  }

  async findOne(id: string, organizationId : string) {
    const category = await this.prisma.guardCategory.findUnique({ where: { id : id , organizationId : organizationId } });
    if (!category) throw new NotFoundException(`GuardCategory ${id} not found`);
    return category;
  }

  async update(id: string, dto: UpdateGuardCategoryDto, organizationId : string) {
    try {
      const guardCategory = await this.prisma.guardCategory.findFirst({
        where : { 
          organizationId : organizationId,
          id : id 
        }});

      if(!guardCategory){
        throw new NotFoundException("this category doesn't exist for this organization");
      }

      return this.prisma.guardCategory.update({ where: { id }, data: dto });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async remove(id: string, organizationId : string ) {
    try {
      const guardCategory = await this.prisma.guardCategory.findFirst({
        where : { 
          organizationId : organizationId,
          id : id 
        }});

      if(!guardCategory){
        throw new NotFoundException("this category doesn't exist for this organization");
      }  
      
      return this.prisma.guardCategory.delete({ where: { id: id, organizationId : organizationId } });
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
