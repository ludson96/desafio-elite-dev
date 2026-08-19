import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados...");

  // 1. Limpar dados anteriores (na ordem correta de integridade referencial)
  await prisma.ticket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("123456", 10);

  // 2. Criar Usuários Obrigatórios
  // 1 Organizador
  const organizer = await prisma.user.create({
    data: {
      name: "Carlos Organizador",
      email: "organizador@verzel.com",
      passwordHash,
      role: "ORGANIZER",
    },
  });

  // 2 Clientes
  const client1 = await prisma.user.create({
    data: {
      name: "Ana Cliente",
      email: "cliente1@verzel.com",
      passwordHash,
      role: "CLIENT",
    },
  });

  const client2 = await prisma.user.create({
    data: {
      name: "Bruno Cliente",
      email: "cliente2@verzel.com",
      passwordHash,
      role: "CLIENT",
    },
  });

  // 1 Portaria
  const gatekeeper = await prisma.user.create({
    data: {
      name: "Roberto Portaria",
      email: "portaria@verzel.com",
      passwordHash,
      role: "GATEKEEPER",
    },
  });

  console.log("✅ Usuários criados:");
  console.log(` - Organizador: ${organizer.email} (senha: 123456)`);
  console.log(` - Cliente 1: ${client1.email} (senha: 123456)`);
  console.log(` - Cliente 2: ${client2.email} (senha: 123456)`);
  console.log(` - Portaria: ${gatekeeper.email} (senha: 123456)`);

  // 3. Criar Eventos Publicados de Teste
  const event1 = await prisma.event.create({
    data: {
      title: "Coldplay - Music of the Spheres Tour",
      description: "Show ao vivo e imperdível com uma das maiores bandas do mundo no Allianz Parque.",
      type: "SHOW",
      category: "Rock / Pop",
      imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), // daqui a 15 dias
      location: "Allianz Parque - São Paulo, SP",
      capacity: 500,
      availableTickets: 498,
      price: 350.0,
      status: "PUBLISHED",
      organizerId: organizer.id,
      externalSource: "Ticketmaster",
      externalEventId: "tm-coldplay-sp-2026",
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: "Duna: Parte 2 - Sessão Especial IMAX",
      description: "A jornada mítica de Paul Atreides ganha vida na maior tela de cinema.",
      type: "MOVIE",
      category: "Ficção Científica",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // daqui a 5 dias
      location: "Cinépolis JK Iguatemi IMAX - São Paulo, SP",
      capacity: 120,
      availableTickets: 120,
      price: 65.0,
      status: "PUBLISHED",
      organizerId: organizer.id,
      externalSource: "TMDb",
      externalEventId: "tmdb-movie-693134",
    },
  });

  console.log("✅ Eventos publicados criados:");
  console.log(` - ${event1.title} (${event1.availableTickets}/${event1.capacity} ingressos)`);
  console.log(` - ${event2.title} (${event2.availableTickets}/${event2.capacity} ingressos)`);

  // 4. Criar uma reserva e 2 ingressos já comprados para Ana Cliente no Evento 1
  const reservation = await prisma.reservation.create({
    data: {
      clientId: client1.id,
      eventId: event1.id,
      quantity: 2,
      totalAmount: 700.0,
      status: "CONFIRMED",
      payment: {
        create: {
          amount: 700.0,
          status: "APPROVED",
        },
      },
      tickets: {
        create: [
          {
            code: "TKT-CP-001-ANA",
            eventId: event1.id,
            status: "ACTIVE",
            qrSignature: "seed-signature-tkt-001",
          },
          {
            code: "TKT-CP-002-ANA",
            eventId: event1.id,
            status: "ACTIVE",
            qrSignature: "seed-signature-tkt-002",
          },
        ],
      },
    },
    include: {
      tickets: true,
    },
  });

  console.log("✅ Reserva e Ingressos de teste criados:");
  console.log(` - Reserva: ${reservation.id} (Status: ${reservation.status})`);
  reservation.tickets.forEach((t) => {
    console.log(`   * Ingresso: ${t.code} (ShareToken: ${t.shareToken})`);
  });

  console.log("\n🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
