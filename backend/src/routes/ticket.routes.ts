import { Router } from "express";
import { ticketController } from "../controllers/ticket.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ensureRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { validateTicketSchema } from "../schemas/ticket.schema.js";

const ticketRoutes = Router();

// Rota Pública para visualização de ingresso compartilhado via link
ticketRoutes.get("/share/:shareToken", ticketController.getSharedTicket);

// Rota Protegida - Apenas Clientes autenticados (área "Meus Ingressos")
ticketRoutes.get("/my-tickets", authMiddleware, ensureRole(["CLIENT"]), ticketController.getMyTickets);

// Rota Protegida - Apenas Portaria (validação na entrada)
ticketRoutes.post(
  "/validate",
  authMiddleware,
  ensureRole(["GATEKEEPER"]),
  validate({ body: validateTicketSchema }),
  ticketController.validate
);

export { ticketRoutes };
