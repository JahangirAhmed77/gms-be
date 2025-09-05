import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, IsOptional, isString } from 'class-validator';

export class CreateEmployeeUserDto {
  
  @ApiProperty()
  @IsUUID()
  employeeId: string;


  @ApiProperty()
  @IsUUID()
  officeId: string;


  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  userName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ description: 'The role to assign to the user' })
  @IsUUID()
  roleId: string;
}
