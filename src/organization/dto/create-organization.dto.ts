import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { CreateOfficeDto } from './create-office-dto';




export class CreateOrganizationDto {

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  organizationName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyLogo: string;

  @ApiPropertyOptional({ type: [CreateOfficeDto] })
  @ValidateNested({ each: true }) @IsOptional() @IsArray() @Type(() => CreateOfficeDto)
  office: CreateOfficeDto[];
}

