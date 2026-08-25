"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Calendar,
  MapPin,
  Music,
  Film,
  Filter,
  ArrowRight,
  Flame,
  Ticket,
} from "lucide-react";
import { eventsApi } from "@/services/api";
import type { Event, EventType } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  // Busca eventos da API
  useEffect(() => {
    let ignore = false;

    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await eventsApi.list({
          page,
          limit: 6,
          search: searchTerm || undefined,
          type: selectedType === "ALL" ? undefined : selectedType,
          status: "PUBLISHED",
        });

        if (!ignore) {
          setEvents(response.data.events);
          setTotalPages(response.data.totalPages);
          setTotalEvents(response.data.total);
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    const timeoutId = setTimeout(fetchEvents, 300);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, selectedType, page]);

  // Evento em destaque (primeiro da lista se não houver busca ativa)
  const featuredEvent = !searchTerm && selectedType === "ALL" && events.length > 0 ? events[0] : null;

  return (
    <div className="flex-1 flex flex-col">
      {/* Banner de Destaque da Semana */}
      {featuredEvent && (
        <section className="relative border-b border-zinc-800 bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl min-h-70 sm:min-h-90 flex flex-col justify-end">
              {/* Imagem de Fundo do Evento com Overlay Escuro */}
              {featuredEvent.imageUrl ? (
                <div className="absolute inset-0">
                  <Image
                    src={featuredEvent.imageUrl}
                    alt={featuredEvent.title}
                    fill
                    unoptimized
                    priority
                    loading="eager"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/30" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-zinc-900" />
              )}

              {/* Conteúdo do Destaque */}
              <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-blue-600 text-white shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    Destaque da Semana
                  </span>
                  <Badge variant={featuredEvent.type === "SHOW" ? "purple" : "default"}>
                    {featuredEvent.type === "SHOW" ? "Show ao Vivo" : "Sessão Especial"}
                  </Badge>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {featuredEvent.title}
                </h1>

                {featuredEvent.description && (
                  <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-2xl leading-relaxed">
                    {featuredEvent.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-300 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{formatDateTime(featuredEvent.date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                    <span>{featuredEvent.location}</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    A partir de {formatCurrency(featuredEvent.price)}
                  </div>
                </div>

                <div className="pt-2">
                  <Link href={`/events/${featuredEvent.id}`}>
                    <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Garantir Ingresso Agora
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seção de Busca & Catálogo Completo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Todos os Eventos
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Explore o catálogo filtrando por shows ou cinema.
            </p>
          </div>

          {/* Filtros de Categoria */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => {
                setSelectedType("ALL");
                setPage(1);
              }}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border whitespace-nowrap",
                selectedType === "ALL"
                  ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Todos ({totalEvents})
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType("SHOW");
                setPage(1);
              }}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border whitespace-nowrap",
                selectedType === "SHOW"
                  ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              )}
            >
              <Music className="w-3.5 h-3.5" />
              Shows & Festivais
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedType("MOVIE");
                setPage(1);
              }}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border whitespace-nowrap",
                selectedType === "MOVIE"
                  ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              )}
            >
              <Film className="w-3.5 h-3.5" />
              Filmes & Cinema
            </button>
          </div>
        </div>

        {/* Input de Busca */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por artista, filme, local ou gênero..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full h-11 pl-10 pr-4 bg-zinc-900 text-zinc-100 placeholder-zinc-500 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Grade de Eventos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden animate-pulse flex flex-col h-96"
              >
                <div className="h-48 bg-zinc-800" />
                <div className="p-5 flex-1 space-y-3">
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                  <div className="h-6 bg-zinc-800 rounded w-3/4" />
                  <div className="h-4 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 px-4 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
              <Ticket className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Nenhum evento encontrado</h3>
              <p className="text-xs text-zinc-400">
                Não encontramos nenhum evento correspondente aos filtros selecionados.
              </p>
            </div>
            {(searchTerm || selectedType !== "ALL") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("ALL");
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {events.map((event, index) => {
              const isSoldOut = event.availableTickets <= 0;
              // Carrega as primeiras imagens com prioridade para acelerar renderização inicial
              const isAboveFold = index < 3;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl flex-1"
                >
                  {/* Banner da Imagem */}
                  <div className="relative h-48 w-full bg-zinc-950 overflow-hidden">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        unoptimized
                        priority={isAboveFold}
                        loading={isAboveFold ? "eager" : "lazy"}
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                        <Ticket className="w-12 h-12 opacity-40" />
                      </div>
                    )}

                    {/* Tag de Tipo & Status */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      <Badge variant={event.type === "SHOW" ? "purple" : "default"}>
                        {event.type === "SHOW" ? "Show" : "Cinema"}
                      </Badge>
                      {event.category && (
                        <span className="bg-zinc-950/80 backdrop-blur-xs text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/10">
                          {event.category}
                        </span>
                      )}
                    </div>

                    {isSoldOut && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge variant="danger">Esgotado</Badge>
                      </div>
                    )}
                  </div>

                  {/* Informações do Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {event.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{formatDateTime(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Preço & Ação */}
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase font-medium">
                          A partir de
                        </span>
                        <span className="text-base font-bold text-white">
                          {formatCurrency(event.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform">
                        <span>{isSoldOut ? "Ver detalhes" : "Garantir Ingresso"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Anterior
            </Button>
            <span className="text-xs text-zinc-400 px-3">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Próxima
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
