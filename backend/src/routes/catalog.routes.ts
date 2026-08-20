import { Router } from "express";
import { catalogController } from "../controllers/catalog.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { searchCatalogSchema } from "../schemas/catalog.schema.js";

const catalogRoutes = Router();

catalogRoutes.get("/search", validate({ query: searchCatalogSchema }), catalogController.search);

export { catalogRoutes };
