import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsDateString, IsEmail, IsOptional, Matches, IsInt, IsNumber, IsDate } from 'class-validator';

export class CreateClientDto {
  // @ApiProperty() @IsUUID()  organizationId: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() contractNumber?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() contractFile?: string;

  @ApiProperty() @IsDate() recruitmentDate: Date;

  @ApiProperty() @IsString()  companyName: string;

  @ApiProperty() @IsString()  industry: string;

  @ApiProperty() @IsString()  websiteLink: string;

  @ApiProperty() @IsString()  address: string;

  @ApiProperty() @IsString()  city: string;

  @ApiProperty() @IsString()  state: string;

  @ApiProperty() @IsString()  country: string;

  @ApiProperty() @IsString()  currentAddress: string;

  @ApiProperty() @IsString()  contactNumber: string;

  @ApiProperty() @IsEmail()  officialEmail: string;

  @ApiPropertyOptional() @IsOptional() @IsString()  POCName: string;

  @ApiPropertyOptional() @IsOptional() @IsString()  POCDesignation: string;

  @ApiPropertyOptional() @IsOptional() @IsEmail()   POCEmail: string;

  @ApiPropertyOptional() @IsOptional() @IsString()  POCContact: string;

  @ApiPropertyOptional() @IsOptional() @IsString()  AlternateContactPerson: string;

  @ApiProperty() @IsOptional()  @IsString() AlternateContactNumber: string;
}
