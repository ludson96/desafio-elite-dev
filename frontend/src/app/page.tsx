"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, MapPin, Ticket, Filter, Music, Film, ArrowRight } from "lucide-react";
import { eventsApi } from "@/services/api";
import type { Event, EventType } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    let ignore = false;
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page,
          limit: 9,
          status: "PUBLISHED" as const,
          search: searchTerm ? searchTerm : undefined,
          type: selectedType !== "ALL" ? selectedType : undefined,
        };

        const response = await eventsApi.list(queryParams);

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
    };

    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [searchTerm, selectedType, page]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Topo Sóbrio & Direto (Estilo Plataforma Real) */}
      <section className="border-b border-zinc-800 bg-zinc-950 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Próximos Eventos
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Explore shows, concertos e sessões de cinema com ingressos disponíveis.
            </p>
          </div>

          {/* Barra de Busca e Filtros Integrados */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Input de Busca */}
            <div className="relative w-full flex-1">
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

            {/* Filtros de Categoria */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedType("ALL");
                  setPage(1);
                }}
                className={cn(
                  "px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border whitespace-nowrap",
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
                  "px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border whitespace-nowrap",
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
                  "px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border whitespace-nowrap",
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
        </div>
      </section>

      {/* Grade de Eventos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isSoldOut = event.availableTickets <= 0;

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
                      <h2 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {event.title}
                      </h2>

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
