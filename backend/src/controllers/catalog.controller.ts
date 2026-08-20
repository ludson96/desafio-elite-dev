import type { Request, Response, NextFunction } from "express";
import {
  externalCatalogService,
  type ExternalCatalogService,
} from "../services/externalCatalog.service.js";
import type { SearchCatalogQuery } from "../schemas/catalog.schema.js";

export class CatalogController {
  constructor(private catalogServiceInstance: ExternalCatalogService = externalCatalogService) {}

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryParams = req.query as unknown as SearchCatalogQuery;
      const items = await this.catalogServiceInstance.searchCatalog(queryParams);

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
