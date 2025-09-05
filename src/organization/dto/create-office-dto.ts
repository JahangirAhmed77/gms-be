import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateOfficeDto {

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  province: string;

  @ApiProperty()
  @IsString()
  branchName: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsOptional()
  addressOpt: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  contactNumberOpt: string;
}