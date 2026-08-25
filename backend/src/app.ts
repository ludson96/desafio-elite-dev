import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRoutes } from "./routes/auth.routes.js";
import { catalogRoutes } from "./routes/catalog.routes.js";
import { eventRoutes } from "./routes/event.routes.js";
import { reservationRoutes } from "./routes/reservation.routes.js";
import { ticketRoutes } from "./routes/ticket.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rota de verificação de saúde da API
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rotas da Aplicação
app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/tickets", ticketRoutes);

// Middleware Global de Tratamento de Erros
app.use(errorHandler);
