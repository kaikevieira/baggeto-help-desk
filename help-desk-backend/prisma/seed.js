import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass  = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: adminPass, role: 'ADMIN' }
  });

  const user = await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: { username: 'user', passwordHash: userPass, role: 'USER' }
  });

  // Tickets de exemplo
  await prisma.ticket.createMany({
    data: [
      { title: 'Erro no login', description: 'Usuário não acessa', status: 'OPEN', priority: 'HIGH', createdById: admin.id },
      { title: 'Impressora parada', description: 'Sem impressão no setor', status: 'IN_PROGRESS', priority: 'MEDIUM', createdById: user.id, assignedToId: admin.id },
      { title: 'Atualizar antivírus', description: 'Agendar atualização', status: 'RESOLVED', priority: 'LOW', createdById: admin.id }
    ]
  });

  console.log('Seed concluído:', { admin: admin.username, user: user.username });
}

main().finally(() => prisma.$disconnect());
