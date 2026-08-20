import { Router } from "express";
import { reservationController } from "../controllers/reservation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ensureRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createReservationSchema } from "../schemas/reservation.schema.js";

const reservationRoutes = Router();

// Todas as rotas de reserva exigem autenticação do cliente
reservationRoutes.use(authMiddleware);

reservationRoutes.post(
  "/",
  ensureRole(["CLIENT"]),
  validate({ body: createReservationSchema }),
  reservationController.create
);

reservationRoutes.get("/my-reservations", reservationController.getMyReservations);
reservationRoutes.get("/:id", reservationController.getById);

export { reservationRoutes };
