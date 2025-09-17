import { PrismaClient } from '@prisma/client';
import { RolesEnum } from '../src/common/enums/roles-enum';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting role seeding...');

  const roles = Object.values(RolesEnum);

  for (const roleName of roles) {
    const existing = await prisma.role.findFirst({ where: { roleName } });
    if (!existing) {
      await prisma.role.create({ data: { roleName } });
      console.log(`✅ Role created: ${roleName}`);
    } else {
      console.log(`⚡ Role already exists: ${roleName}`);
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
