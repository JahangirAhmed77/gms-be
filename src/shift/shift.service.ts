import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Injectable()
export class ShiftService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateShiftDto) {
    return this.prisma.shift.create({ data: dto });
  }

  findAll() {
    return this.prisma.shift.findMany();
  }

  async findOne(id: string) {
    const category = await this.prisma.shift.findUnique({ where: { id } });
    if (!category) throw new NotFoundException(`Shift with ${id} not found`);
    return category;
  }

  async update(id: string, dto: UpdateShiftDto) {
    await this.findOne(id); 
    return this.prisma.shift.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id); 
    return this.prisma.shift.delete({ where: { id } });
  }
}
