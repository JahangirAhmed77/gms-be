import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
  } from '@nestjs/common';
  import { OrganizationService } from './organization.service';
  import { CreateOrganizationDto } from './dto/create-organization.dto';
  import { UpdateOrganizationDto } from './dto/update-organization.dto';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/common/guards/role-guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { RolesEnum } from 'src/common/enums/roles-enum';
import { GetOrganizationId } from 'src/common/decorators/get-organization-Id.decorator';
import { CreateOfficeDto } from './dto/create-office-dto';
import { CreateBankAccountDto } from 'src/guard/dto/create-guard-dto';
import { CreateOrganizationBankAccountDto } from './dto/create-bank-account.dto';
  
  @ApiTags('Organizations')
  @ApiBearerAuth('jwt')
  @Controller('organizations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) {}
  
    @Post("register")
    @Roles('superAdmin')
    @ResponseMessage('Organization registered successfully')
    create(@Body() dto: CreateOrganizationDto) {
      return this.organizationService.create(dto);
    }
  
    @Get()
    @Roles('superAdmin') 
    findAll() {
      return this.organizationService.findAll();
    }

    @Post('add-office')
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolesEnum.organizationAdmin)
    @ResponseMessage('Office created successfully')
    addOffice(@Body() dto: CreateOfficeDto, @GetOrganizationId()  organizationId : string  ){
      return this.organizationService.addOffice(dto, organizationId);
    }
    
    @Post('add/bank-account')
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolesEnum.organizationAdmin)
    @ResponseMessage('Bank Account added successfully')
    addBankAccount(@Body() dto: CreateOrganizationBankAccountDto, @GetOrganizationId()  organizationId : string  ){
      return this.organizationService.addBankAccount(dto, organizationId);
    }


    @Get('/get-offices')
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolesEnum.organizationAdmin)
    @ResponseMessage('Offices fetched successfully')
    getOffices(@GetOrganizationId() organizationId : string  ){
      return this.organizationService.getOffices(organizationId);
    }
    
    @Get('/get/all/bank-accounts')
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolesEnum.organizationAdmin)
    @ResponseMessage('Bank Accounts fetched successfully')
    getAllBankAccounts(@GetOrganizationId() organizationId : string  ){
      return this.organizationService.getAllBankAccounts(organizationId);
    }

    @Delete('delete-office:id')
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolesEnum.organizationAdmin)
    @ResponseMessage('Office deleted successfully')
    deleteOffice(@Param("id") id: string, @GetOrganizationId()  organizationId : string  ){
      return this.organizationService.deleteOffice(id, organizationId);
    }  
  
    @Get(':id')
    @Roles('superAdmin') 
    findOne(@Param('id') id: string) {
      return this.organizationService.findOne(id);
    }
  
    @Patch(':id')
    @Roles('superAdmin') 
    update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
      return this.organizationService.update(id, dto);
    }
  
    @Delete(':id')
    @Roles('superAdmin') 
    remove(@Param('id') id: string) {
      return this.organizationService.remove(id);
    }
}
  