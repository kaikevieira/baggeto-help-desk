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

  // Tickets de transporte de exemplo com dados completos
  await prisma.ticket.createMany({
    data: [
      {
        ticketNumber: '100001',
        title: 'Transporte Florianópolis → São Paulo - Carga Geral',
        description: 'Transporte de mercadorias gerais com urgência alta. Cliente solicitando coleta imediata.',
        status: 'OPEN',
        priority: 'HIGH',
        createdById: user.id,
        assignedToId: admin.id,
        
        // Localidades
        originCity: 'Florianópolis',
        originUF: 'SC',
        originIBGEId: 4205407,
        destinationCity: 'São Paulo',
        destinationUF: 'SP',
        destinationIBGEId: 3550308,
        
        // Detalhes do transporte
        freightBasis: 'FULL',
        incoterm: 'CIF',
        paymentTerm: '30 dias',
        paymentType: 'Faturado',
        cargoWeight: 15.500,
        billingCompany: 'Empresa ABC Ltda',
        plateCavalo: 'ABC-1234',
        plateCarreta1: 'XYZ-9876',
        plateCarreta2: null,
        plateCarreta3: null,
        fleetType: 'FROTA',
        thirdPartyPayment: null,
        serviceTaker: 'João Silva'
      },
      {
        ticketNumber: '100002',
        title: 'Transporte Joinville → Rio de Janeiro - Frete Terceiro',
        description: 'Carga fracionada para entrega no centro do RJ. Verificar disponibilidade de terceiro.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        createdById: admin.id,
        assignedToId: user.id,
        
        // Localidades
        originCity: 'Joinville',
        originUF: 'SC',
        originIBGEId: 4209102,
        destinationCity: 'Rio de Janeiro',
        destinationUF: 'RJ',
        destinationIBGEId: 3304557,
        
        // Detalhes do transporte
        freightBasis: 'TON',
        incoterm: 'FOB',
        paymentTerm: '15 dias',
        paymentType: 'À vista',
        cargoWeight: 8.750,
        billingCompany: 'Transportadora XYZ',
        plateCavalo: null,
        plateCarreta1: null,
        plateCarreta2: null,
        plateCarreta3: null,
        fleetType: 'TERCEIRO',
        thirdPartyPayment: 2500.00,
        serviceTaker: 'Maria Santos'
      },
      {
        ticketNumber: '100003',
        title: 'Transporte Blumenau → Porto Alegre - Carga Completa',
        description: 'Transporte de equipamentos industriais. Carga sensível, requer cuidados especiais.',
        status: 'RESOLVED',
        priority: 'LOW',
        createdById: user.id,
        assignedToId: admin.id,
        
        // Localidades
        originCity: 'Blumenau',
        originUF: 'SC',
        originIBGEId: 4202404,
        destinationCity: 'Porto Alegre',
        destinationUF: 'RS',
        destinationIBGEId: 4314902,
        
        // Detalhes do transporte
        freightBasis: 'FULL',
        incoterm: 'CIF',
        paymentTerm: '45 dias',
        paymentType: 'Boleto',
        cargoWeight: 22.300,
        billingCompany: 'Indústria DEF S.A.',
        plateCavalo: 'DEF-5678',
        plateCarreta1: 'GHI-3456',
        plateCarreta2: 'JKL-7890',
        plateCarreta3: null,
        fleetType: 'FROTA',
        thirdPartyPayment: null,
        serviceTaker: 'Carlos Oliveira'
      },
      {
        ticketNumber: '100004',
        title: 'Transporte Urgent: Itajaí → Curitiba - Perecível',
        description: 'Transporte de produtos perecíveis com temperatura controlada. Entrega urgente.',
        status: 'OPEN',
        priority: 'URGENT',
        createdById: admin.id,
        assignedToId: null,
        
        // Localidades
        originCity: 'Itajaí',
        originUF: 'SC',
        originIBGEId: 4208203,
        destinationCity: 'Curitiba',
        destinationUF: 'PR',
        destinationIBGEId: 4106902,
        
        // Detalhes do transporte
        freightBasis: 'FULL',
        incoterm: 'CIF',
        paymentTerm: '7 dias',
        paymentType: 'PIX',
        cargoWeight: 12.800,
        billingCompany: 'Frigorífico GHI',
        plateCavalo: 'GHI-9999',
        plateCarreta1: 'MNO-1111',
        plateCarreta2: null,
        plateCarreta3: null,
        fleetType: 'FROTA',
        thirdPartyPayment: null,
        serviceTaker: 'Ana Costa'
      },
      {
        ticketNumber: '100005',
        title: 'Coleta Chapecó → Região Sul - Multi-destino',
        description: 'Coleta em Chapecó com entregas em múltiplas cidades da região sul.',
        status: 'CLOSED',
        priority: 'MEDIUM',
        createdById: user.id,
        assignedToId: admin.id,
        
        // Localidades
        originCity: 'Chapecó',
        originUF: 'SC',
        originIBGEId: 4204202,
        destinationCity: 'Múltiplos destinos',
        destinationUF: 'RS',
        destinationIBGEId: null,
        
        // Detalhes do transporte
        freightBasis: 'TON',
        incoterm: 'FOB',
        paymentTerm: '30 dias',
        paymentType: 'Transferência',
        cargoWeight: 18.900,
        billingCompany: 'Distribuidora Sul',
        plateCavalo: 'SUL-2023',
        plateCarreta1: 'DST-4567',
        plateCarreta2: 'DST-8901',
        plateCarreta3: 'DST-2345',
        fleetType: 'FROTA',
        thirdPartyPayment: null,
        serviceTaker: 'Roberto Lima'
      }
    ]
  });

  console.log('Seed concluído:', { 
    admin: admin.username, 
    user: user.username, 
    tickets: 'Criados 5 tickets de transporte com dados completos' 
  });
}

main().finally(() => prisma.$disconnect());
