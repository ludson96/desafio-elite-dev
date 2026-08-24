import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

const DEFAULT_SHOW_COVER =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80";

const DEFAULT_MOVIE_COVER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80";

async function main() {
  console.log("🌱 Iniciando o seed do banco de dados com capas padronizadas...");

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
      email: "organizador@eliteingressos.com",
      passwordHash,
      role: "ORGANIZER",
    },
  });

  // 2 Clientes
  const client1 = await prisma.user.create({
    data: {
      name: "Ana Cliente",
      email: "cliente1@eliteingressos.com",
      passwordHash,
      role: "CLIENT",
    },
  });

  const client2 = await prisma.user.create({
    data: {
      name: "Bruno Cliente",
      email: "cliente2@eliteingressos.com",
      passwordHash,
      role: "CLIENT",
    },
  });

  // 1 Portaria
  const gatekeeper = await prisma.user.create({
    data: {
      name: "Roberto Portaria",
      email: "portaria@eliteingressos.com",
      passwordHash,
      role: "GATEKEEPER",
    },
  });

  console.log("✅ Usuários criados:");
  console.log(` - Organizador: ${organizer.email} (senha: 123456)`);
  console.log(` - Cliente 1: ${client1.email} (senha: 123456)`);
  console.log(` - Cliente 2: ${client2.email} (senha: 123456)`);
  console.log(` - Portaria: ${gatekeeper.email} (senha: 123456)`);

  // 3. Criar Eventos Publicados com Capas Padronizadas do Unsplash
  const event1 = await prisma.event.create({
    data: {
      title: "Coldplay - Music of the Spheres Tour",
      description: "Show ao vivo e imperdível com uma das maiores bandas do mundo no Allianz Parque com pulseiras de LED e espetáculo visual.",
      type: "SHOW",
      category: "Rock / Pop",
      imageUrl: DEFAULT_SHOW_COVER,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
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

  await prisma.event.create({
    data: {
      title: "Rock in Rio 2026 - Dia do Metal",
      description: "O maior festival de música do planeta com as maiores lendas do Heavy Metal e Rock Internacional na Cidade do Rock.",
      type: "SHOW",
      category: "Festival / Heavy Metal",
      imageUrl: DEFAULT_SHOW_COVER,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
      location: "Cidade do Rock - Rio de Janeiro, RJ",
      capacity: 1000,
      availableTickets: 1000,
      price: 490.0,
      status: "PUBLISHED",
      organizerId: organizer.id,
      externalSource: "Ticketmaster",
      externalEventId: "tm-rir-metal-2026",
    },
  });

  await prisma.event.create({
    data: {
      title: "Ludmilla - Numanice Ao Vivo",
      description: "O projeto de pagode mais aclamado do Brasil em uma edição especial ao pôr do sol com participações especiais.",
      type: "SHOW",
      category: "Pagode / Samba",
      imageUrl: DEFAULT_SHOW_COVER,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
      location: "Estádio do Morumbi - São Paulo, SP",
      capacity: 300,
      availableTickets: 300,
      price: 180.0,
      status: "PUBLISHED",
      organizerId: organizer.id,
      externalSource: "Ticketmaster",
      externalEventId: "tm-numanice-sp",
    },
  });

  await prisma.event.create({
    data: {
      title: "Alok - The Ocean Electronic Experience",
      description: "Show imersivo com efeitos visuais em laser 3D e pirotecnia de ponta ao som das melhores tracks eletrônicas.",
      type: "SHOW",
      category: "Eletrônica / EDM",
      imageUrl: DEFAULT_SHOW_COVER,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      location: "Arena Anhembi - São Paulo, SP",
      capacity: 400,
      availableTickets: 400,
      price: 220.0,
      status: "PUBLISHED",
      organizerId: organizer.id,
      externalSource: "Ticketmaster",
      externalEventId: "tm-alok-ocean",
    },
  });

  await prisma.event.create({
    data: {
      title: "Duna: Parte 2 - Sessão Especial IMAX",
      description: "A jornada mítica de Paul Atreides ganha vida na maior tela de cinema com som Dolby Atmos imersivo.",
      type: "MOVIE",
      category: "Ficção Científica",
      imageUrl: DEFAULT_MOVIE_COVER,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
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

  await prisma.event.create({
    data: {
      title: "Batman: O Cavaleiro das Trevas - Edição 4K",
      description: "Sessão comemorativa de um dos maiores clássicos do cinema com introdução especial e pôster de colecionador.",
      type: "MOVIE",
      category: "Ação / Policial",
      imageUrl: DEFAULT_MOVIE_COVER,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8),
      location: "Cinemark Shopping Cidade Jardim - São Paulo, SP",
      capacity: 90,
      availableTickets: 90,
      price: 55.0,
      status: "PUBLISHED",
      organizerId: organizer.id,
      externalSource: "TMDb",
      externalEventId: "tmdb-movie-155",
    },
  });

  await prisma.event.create({
    data: {
      title: "Interestelar - Sessão Noturna 70mm",
      description: "A viagem interestelar através de um buraco de minhoca em busca da sobrevivência da humanidade.",
      type: "MOVIE",
      category: "Sci-Fi / Drama",
      imageUrl: DEFAULT_MOVIE_COVER,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
      location: "Espaço Itaú de Cinema Augusta - São Paulo, SP",
      capacity: 110,
      availableTickets: 110,
      price: 48.0,
      status: "PUBLISHED",
      organizerId: organizer.id,
      externalSource: "TMDb",
      externalEventId: "tmdb-movie-157336",
    },
  });

  await prisma.event.create({
    data: {
      title: "Divertida Mente 2 - Sessão Família 3D",
      description: "Acompanhe as novas emoções de Riley na adolescência em uma sessão com óculos 3D e combo promocional.",
      type: "MOVIE",
      category: "Animação / Família",
      imageUrl: DEFAULT_MOVIE_COVER,
      date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
      location: "UCI Anália Franco IMAX - São Paulo, SP",
      capacity: 150,
      availableTickets: 150,
      price: 42.0,
      status: "PUBLISHED",
      organizerId: organizer.id,
      externalSource: "TMDb",
      externalEventId: "tmdb-movie-1022789",
    },
  });

  console.log("✅ 8 Eventos criados com capas oficiais padronizadas do Unsplash!");

  // 4. Criar Reserva de Teste para o Cliente 1
  const reservation = await prisma.reservation.create({
    data: {
      quantity: 2,
      totalAmount: 700.0,
      status: "CONFIRMED",
      clientId: client1.id,
      eventId: event1.id,
    },
  });

  // Pagamento da Reserva
  await prisma.payment.create({
    data: {
      amount: 700.0,
      status: "APPROVED",
      reservationId: reservation.id,
    },
  });

  // 5. Ingressos de Teste com QR Signature e ShareToken
  const ticket1 = await prisma.ticket.create({
    data: {
      code: "TKT-CP-001-ANA",
      qrSignature: "sig_seed_mock_hmac_coldplay_001",
      shareToken: "35557fe9-c0fa-4936-a25b-6d0d4698f637",
      status: "ACTIVE",
      eventId: event1.id,
      reservationId: reservation.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      code: "TKT-CP-002-ANA",
      qrSignature: "sig_seed_mock_hmac_coldplay_002",
      shareToken: "03473536-3176-4aa8-b8f2-8a4aa16856c7",
      status: "ACTIVE",
      eventId: event1.id,
      reservationId: reservation.id,
    },
  });

  console.log("✅ Reserva e Ingressos de teste criados com sucesso!");
  console.log("\n🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
