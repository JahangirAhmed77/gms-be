import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesEnum } from 'src/common/enums/roles-enum';

@Injectable()
export class AuthService {
  constructor( private prisma: PrismaService ,private userService: UserService, private jwtService: JwtService) {}

  async signup(dto: RegisterDto) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const role = await this.prisma.role.findFirst({where : { roleName : dto.roleName}});
    if (!role) {
      throw new NotFoundException(`Role '${dto.roleName}' not found`);
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10); 

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword, 
        userName: dto.userName,
      },
    });

    const userRole = await this.prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
      },
    }); 

    let token : string;
    const roleId = role.id;

    if(role?.roleName == "organizationAdmin"){
      const organization = await this.prisma.organization.findFirst({where : { userId : user.id }})
      if(organization == null ){
        throw new NotFoundException("Organization not found for this admin")
      }
      token = await this.generateOrgToken(user.id, user.email,roleId, organization.id );
    }    
    else{
      token = await this.generateToken(user.id, user.email,roleId );
    }

    return { token, user };
  }

  async login(dto : LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const roleId = user.userRoles[0].roleId;

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    //check for organization Admin
    let token : string;
    
    const role = await this.prisma.role.findFirst({ where : { id : roleId }});
    console.log(role);

    if(role?.roleName == "organizationAdmin"){
      const organization = await this.prisma.organization.findFirst({where : { userId : user.id }})
      if(organization == null ){
        throw new NotFoundException("Organization not found for this manager")
      }
      console.log("orgadmin token generated");
      token = await this.generateOrgToken(user.id, user.email,roleId, organization.id );
    }

    else if(role?.roleName == RolesEnum.manager){
      const organization = await this.prisma.organization.findFirst({where : { userId : user.id }})
      if(organization == null ){
        throw new NotFoundException("Organization not found for this manager")
      }
      const userOffice = await this.prisma.userOffice.findFirst({ where : { userId : user.id }});
       if(userOffice == null ){
        throw new NotFoundException("Office not found for this manager")
      }
      console.log("manager token generated");
      token = await this.generateStaffToken(user.id, user.email,roleId, organization.id, userOffice.officeId  );
    }  
    else{
      console.log("normal token generated");
      token = await this.generateToken(user.id, user.email,roleId );
    }

    return { token, user };
  }

  private async generateToken(userId: string, email: string, roleId : string) {
    const payload = { sub: userId, email, roleId  };
    return this.jwtService.signAsync(payload, {expiresIn : "1d"});
  }

  private async generateOrgToken(userId: string, email: string, roleId : string, organizationId : string) {
    const payload = { sub: userId, email, roleId, organizationId  };
    return this.jwtService.signAsync(payload, {expiresIn : "1d"});
  }

  private async generateStaffToken(userId: string, email: string, roleId : string, organizationId : string, officeId : string) {
    const payload = { sub: userId, email, roleId, organizationId, officeId  };
    return this.jwtService.signAsync(payload, {expiresIn : "1d"});
  }
}
