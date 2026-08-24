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

    // 1. Tenta buscar no TMDb se houver chave e tipo for MOVIE ou ALL
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
          const movies = tmdbRes.data.results.slice(0, 6).map((m: any) => {
            // Prioriza o backdrop panorâmico (banner horizontal) ou o poster oficial
            const bannerPath = m.backdrop_path || m.poster_path;
            const imageUrl = bannerPath
              ? `https://image.tmdb.org/t/p/w1280${bannerPath}`
              : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80";

            return {
              externalId: `tmdb-${m.id}`,
              externalSource: "TMDB" as const,
              title: m.title,
              description: m.overview || "Sem descrição disponível.",
              type: "MOVIE" as const,
              category: "Cinema",
              imageUrl,
              suggestedPrice: 45.0,
            };
          });
          items.push(...movies);
        }
      } catch (err) {
        console.warn("⚠️ Falha ao buscar no TMDb, usando dados de demonstração.");
      }
    }

    // 2. Tenta buscar no Ticketmaster se houver chave e tipo for SHOW ou ALL
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
          const shows = tmRes.data._embedded.events.slice(0, 6).map((e: any) => {
            // Escolhe a imagem widescreen de maior resolução disponível na Ticketmaster
            const widescreenImage =
              e.images?.find((img: any) => img.ratio === "16_9" && img.width >= 1024)?.url ||
              e.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80";

            return {
              externalId: `tm-${e.id}`,
              externalSource: "TICKETMASTER" as const,
              title: e.name,
              description: e.info || e.pleaseNote || "Show ao vivo imperdível.",
              type: "SHOW" as const,
              category: e.classifications?.[0]?.genre?.name || "Música / Show",
              imageUrl: widescreenImage,
              suggestedPrice: 250.0,
            };
          });
          items.push(...shows);
        }
      } catch (err) {
        console.warn("⚠️ Falha ao buscar no Ticketmaster, usando dados de demonstração.");
      }
    }

    // 3. Fallback tolerante a falhas
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
