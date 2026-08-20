import axios from "axios";
import { env } from "../config/env.js";
import type { SearchCatalogQuery } from "../schemas/catalog.schema.js";
import { DEMO_CATALOG } from "../constants/demoCatalog.js";

export interface ExternalCatalogItem {
  externalId: string;
  externalSource: "TMDB" | "TICKETMASTER" | "DEMO";
  title: string;
  description: string;
  type: "MOVIE" | "SHOW";
  category: string;
  imageUrl: string;
  suggestedPrice?: number;
}

export class ExternalCatalogService {
  async searchCatalog(params: SearchCatalogQuery): Promise<ExternalCatalogItem[]> {
    const { query, type } = params;
    const items: ExternalCatalogItem[] = [];

    // Tenta buscar no TMDb se houver chave e tipo for MOVIE ou ALL
    if (env.TMDB_API_KEY && (type === "ALL" || type === "MOVIE")) {
      try {
        const tmdbRes = await axios.get("https://api.themoviedb.org/3/search/movie", {
          params: {
            api_key: env.TMDB_API_KEY,
            query: query || "Ação",
            language: "pt-BR",
          },
        });

        if (tmdbRes.data?.results) {
          const movies = tmdbRes.data.results.slice(0, 5).map((m: any) => ({
            externalId: `tmdb-${m.id}`,
            externalSource: "TMDB" as const,
            title: m.title,
            description: m.overview || "Sem descrição disponível.",
            type: "MOVIE" as const,
            category: "Cinema",
            imageUrl: m.poster_path
              ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
              : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
            suggestedPrice: 40.0,
          }));
          items.push(...movies);
        }
      } catch (err) {
        console.warn("⚠️ Falha ao buscar no TMDb, usando dados de demonstração.");
      }
    }

    // Tenta buscar no Ticketmaster se houver chave e tipo for SHOW ou ALL
    if (env.TICKETMASTER_API_KEY && (type === "ALL" || type === "SHOW")) {
      try {
        const tmRes = await axios.get("https://app.ticketmaster.com/discovery/v2/events.json", {
          params: {
            apikey: env.TICKETMASTER_API_KEY,
            keyword: query || "music",
            classificationName: "music",
          },
        });

        if (tmRes.data?._embedded?.events) {
          const shows = tmRes.data._embedded.events.slice(0, 5).map((e: any) => ({
            externalId: `tm-${e.id}`,
            externalSource: "TICKETMASTER" as const,
            title: e.name,
            description: e.info || e.pleaseNote || "Show ao vivo imperdível.",
            type: "SHOW" as const,
            category: e.classifications?.[0]?.genre?.name || "Música / Show",
            imageUrl:
              e.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80",
            suggestedPrice: 250.0,
          }));
          items.push(...shows);
        }
      } catch (err) {
        console.warn("⚠️ Falha ao buscar no Ticketmaster, usando dados de demonstração.");
      }
    }

    // Se nenhuma API externa respondeu ou nenhuma chave foi configurada, usa o catálogo demonstrativo
    if (items.length === 0) {
      let filtered = DEMO_CATALOG;

      if (type !== "ALL") {
        filtered = filtered.filter((item) => item.type === type);
      }

      if (query.trim()) {
        const qLower = query.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(qLower) ||
            item.category.toLowerCase().includes(qLower)
        );
      }

      return filtered;
    }

    return items;
  }
}

export const externalCatalogService = new ExternalCatalogService();
