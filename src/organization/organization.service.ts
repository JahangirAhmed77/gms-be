import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateOfficeDto } from './dto/create-office-dto';
import { CreateOrganizationBankAccountDto } from './dto/create-bank-account.dto';
import { generateRandomNumber } from 'src/common/utils/random-num-generator';
import { RolesEnum } from 'src/common/enums/roles-enum';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService, private userService: UserService) {}

  /** ---------------- CREATE ORGANIZATION ---------------- */
  async create(dto: CreateOrganizationDto) {
    try {
      // 1. Check if user already exists
      const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingUser) throw new ConflictException('Email already exists');

      // 2. Create organization admin user
      const adminUser = await this.userService.create({
        email: dto.email,
        password: dto.password,
        userName: dto.userName,
        roleName: RolesEnum.organizationAdmin,
      });

      // 3. Create organization and link admin user
      const organization = await this.prisma.organization.create({
        data: {
          organizationName: dto.organizationName,
          organizationLogo: dto.organizationLogo,
          province: dto.province,
          city: dto.city,
          phoneNumber1: dto.phoneNumber1,
          phoneNumber2: dto.phoneNumber2,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2,
          email: dto.email,
          userId: adminUser.id,
          office: dto.office
            ? { create: dto.office.map((o: CreateOfficeDto) => ({ ...o, branchCode: generateRandomNumber(4) })) }
            : undefined,
        },
        include: { office: true, user: true },
      });

      // 4. Link admin user to all offices
      if (organization.office?.length > 0) {
        for (const o of organization.office) {
          await this.prisma.userOffice.create({
            data: { userId: adminUser.id, organizationId: organization.id, officeId: o.id },
          });
        }
      }

      return organization;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create organization', { cause: error });
    }
  }

  /** ---------------- ADD OFFICE ---------------- */
  async addOffice(dto: CreateOfficeDto, organizationId: string) {
    if (!organizationId) throw new NotFoundException('Organization ID missing');

    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException("Organization doesn't exist");

    const branchCode = generateRandomNumber(4);
    return this.prisma.office.create({ data: { ...dto, organizationId, branchCode }, include: { organization: true } });
  }

  /** ---------------- ADD BANK ACCOUNT ---------------- */
  async addBankAccount(dto: CreateOrganizationBankAccountDto, organizationId: string) {
    if (!organizationId) throw new NotFoundException('Organization ID missing');

    const org = await this.prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) throw new NotFoundException("Organization doesn't exist");

    return this.prisma.organizationBankAccount.create({ data: { ...dto, organizationId }, include: { organization: true } });
  }

  /** ---------------- GET OFFICES ---------------- */
  async getOffices(organizationId: string) {
    if (!organizationId) throw new NotFoundException('Organization ID missing');

    return this.prisma.office.findMany({ where: { organizationId }, include: { organization: true } });
  }

  /** ---------------- GET ALL BANK ACCOUNTS ---------------- */
  async getAllBankAccounts(organizationId: string) {
    if (!organizationId) throw new NotFoundException('Organization ID missing');

    return this.prisma.organizationBankAccount.findMany({ where: { organizationId } });
  }

  /** ---------------- DELETE OFFICE ---------------- */
  async deleteOffice(officeId: string, organizationId: string) {
    const office = await this.prisma.office.findUnique({ where: { id: officeId } });
    if (!office || office.organizationId !== organizationId) throw new NotFoundException("Office with this ID doesn't exist");

    return this.prisma.office.delete({ where: { id: officeId } });
  }

  /** ---------------- GET ALL ORGANIZATIONS ---------------- */
  async findAll() {
    return this.prisma.organization.findMany({ include: { user: true, employee: true } });
  }

  /** ---------------- GET ORGANIZATION BY ID ---------------- */
  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({ where: { id }, include: { user: true, employee: true } });
    if (!org) throw new NotFoundException(`Organization with ID ${id} not found`);
    return org;
  }

  /** ---------------- UPDATE ORGANIZATION ---------------- */
  async update(id: string, dto: UpdateOrganizationDto) {
    const existing = await this.prisma.organization.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Organization with ID ${id} not found`);

    const { office, ...rest } = dto;
    const updatedOrg = await this.prisma.organization.update({ where: { id }, data: rest });

    if (office && office.length > 0) {
      for (const o of office) {
        await this.prisma.office.create({ data: { ...o, organization: { connect: { id } }, branchCode: generateRandomNumber(4) } });
      }
    }

    return updatedOrg;
  }

  /** ---------------- DELETE ORGANIZATION ---------------- */
  async remove(id: string) {
    const existing = await this.prisma.organization.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Organization with ID ${id} not found`);

    return this.prisma.organization.delete({ where: { id } });
  }
}
