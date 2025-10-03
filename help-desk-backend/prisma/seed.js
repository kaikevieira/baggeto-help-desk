import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('!B@ggeto.1020', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: adminPass, role: 'ADMIN' }
  });

  console.log('Seed concluído:', { 
    admin: admin.username
  });
}

main().finally(() => prisma.$disconnect());
