import { Router } from "express";
import { eventController } from "../controllers/event.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ensureRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createEventSchema,
  updateEventSchema,
  listEventsQuerySchema,
} from "../schemas/event.schema.js";

const eventRoutes = Router();

// Rotas Públicas
eventRoutes.get("/", validate({ query: listEventsQuerySchema }), eventController.list);
eventRoutes.get("/:id", eventController.getById);

// Rotas Protegidas - Apenas Organizadores (ORGANIZER)
eventRoutes.get(
  "/organizer/my-events",
  authMiddleware,
  ensureRole(["ORGANIZER"]),
  eventController.getMyEvents
);

eventRoutes.post(
  "/",
  authMiddleware,
  ensureRole(["ORGANIZER"]),
  validate({ body: createEventSchema }),
  eventController.create
);

eventRoutes.put(
  "/:id",
  authMiddleware,
  ensureRole(["ORGANIZER"]),
  validate({ body: updateEventSchema }),
  eventController.update
);

export { eventRoutes };
