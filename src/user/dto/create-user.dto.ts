import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateUserDto {
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
  @IsString()
  roleName: string;
}
