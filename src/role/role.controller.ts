import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe,
    UseGuards,
  } from '@nestjs/common';
  import { RoleService } from './role.service';
  import { CreateRoleDto } from './dto/create-role.dto';
  import { UpdateRoleDto } from './dto/update-role.dto';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-guard';
import { RolesGuard } from 'src/common/guards/role-guard';
import { RolesEnum } from 'src/common/enums/roles-enum';
  
  @ApiTags('roles')
  @Controller('roles')
  export class RoleController {
    constructor(private readonly roleService: RoleService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create a new role' })
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolesEnum.superAdmin)
    @ApiResponse({ status: 201, description: 'Role created successfully' })
    create(@Body() createRoleDto: CreateRoleDto) {
      return this.roleService.create(createRoleDto.roleName);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all roles' })
    findAll() {
      return this.roleService.findAll();
    }

    @Get("/for-organization")
    @ApiOperation({ summary: 'Get all roles for organization' })
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolesEnum.organizationAdmin)
    findForOrganization() {
      return this.roleService.findForOrganization();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a role by ID' })
    findOne(@Param('id', new ParseUUIDPipe()) id: string)  {
      return this.roleService.findOne(id);
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a role' })
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolesEnum.superAdmin)
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateRoleDto: UpdateRoleDto) {
      return this.roleService.update(id, updateRoleDto.roleName);
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a role' })
    @ApiBearerAuth('jwt')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RolesEnum.superAdmin)
    remove(@Param('id') id: string) {
      return this.roleService.remove(id);
    }
  }
  