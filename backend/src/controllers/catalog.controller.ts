import type { Request, Response, NextFunction } from "express";
import {
  externalCatalogService,
  type ExternalCatalogService,
} from "../services/externalCatalog.service.js";
import type { SearchCatalogQuery } from "../schemas/catalog.schema.js";

export class CatalogController {
  constructor(private catalogService: ExternalCatalogService = externalCatalogService) {}

  search = async (
    req: Request<Record<string, never>, unknown, unknown, SearchCatalogQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const items = await this.catalogService.searchCatalog(req.query);

      res.status(200).json({
        status: "success",
        results: items.length,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const catalogController = new CatalogController();
