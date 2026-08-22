"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, MapPin, Ticket, Sparkles, Filter, Music, Film, ArrowRight } from "lucide-react";
import { eventsApi } from "@/services/api";
import type { Event, EventType } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils/cn";

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedType, setSelectedType] = useState<EventType | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function startFetching() {
      setIsLoading(true);
      try {
        const response = await eventsApi.list({
          page,
          limit: 9,
          search: activeSearch.trim() || undefined,
          type: selectedType === "ALL" ? undefined : selectedType,
          status: "PUBLISHED",
        });

        if (!ignore) {
          setEvents(response.data.events);
          setTotalPages(response.data.totalPages || 1);
          setTotalEvents(response.data.total || 0);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Erro ao carregar eventos:", error);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    startFetching();

    return () => {
      ignore = true;
    };
  }, [page, selectedType, activeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(search);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 border-b border-zinc-800/80 overflow-hidden bg-gradient-to-b from-blue-950/20 via-zinc-950 to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Os Melhores Shows e Filmes em um só Lugar</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Descubra eventos inesquecíveis com ingressos{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              100% autênticos
            </span>
            .
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
            Compre em segundos com pagamento simulado, receba seu ingresso com QR Code criptográfico anti-fraude e
            compartilhe com quem você ama.
          </p>

          {/* Barra de Busca do Hero */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 pt-4">
            <div className="flex-1 w-full">
              <Input
                placeholder="Busque por artista, filme, festival ou cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="h-12 bg-zinc-900/90 border-zinc-700 text-base"
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto h-12 px-6">
              Buscar Eventos
            </Button>
          </form>
        </div>
      </section>

      {/* Seção Principal de Eventos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        {/* Filtros e Contadores */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Eventos Disponíveis
            </h2>
            <p className="text-xs text-zinc-400">
              {isLoading
                ? "Carregando..."
                : `${totalEvents} ${totalEvents === 1 ? "evento encontrado" : "eventos encontrados"}`}
            </p>
          </div>

          {/* Filtros de Tipo */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1.5 rounded-xl border border-zinc-800">
            <button
              onClick={() => {
                setSelectedType("ALL");
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                selectedType === "ALL"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Todos
            </button>
            <button
              onClick={() => {
                setSelectedType("SHOW");
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                selectedType === "SHOW"
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Music className="w-3.5 h-3.5" />
              Shows & Festivais
            </button>
            <button
              onClick={() => {
                setSelectedType("MOVIE");
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                selectedType === "MOVIE"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Film className="w-3.5 h-3.5" />
              Filmes & Cinema
            </button>
          </div>
        </div>

        {/* Grid de Cards de Eventos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
              <Ticket className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-zinc-200">Nenhum evento encontrado</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Tente ajustar os termos da busca ou mudar o filtro de categoria.
              </p>
            </div>
            {activeSearch && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setActiveSearch("");
                  setPage(1);
                }}
              >
                Limpar busca
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const isSoldOut = event.availableTickets <= 0;

              return (
                <div
                  key={event.id}
                  className="group bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
                >
                  {/* Imagem do Evento com Next Image */}
                  <div className="relative h-48 w-full bg-zinc-950 overflow-hidden">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-zinc-900 to-zinc-800 text-zinc-600">
                        <Ticket className="w-12 h-12 opacity-40" />
                      </div>
                    )}

                    {/* Badges Flutuantes */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                      <Badge variant={event.type === "SHOW" ? "purple" : "default"}>
                        {event.type === "SHOW" ? "Show" : "Filme"}
                      </Badge>
                      {event.category && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
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

                  {/* Informações */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {event.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span>{formatDateTime(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 pt-1">{event.description}</p>
                      )}
                    </div>

                    {/* Rodapé do Card */}
                    <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                          A partir de
                        </span>
                        <span className="text-lg font-bold text-white">
                          {formatCurrency(event.price)}
                        </span>
                      </div>

                      <Link href={`/events/${event.id}`}>
                        <Button
                          size="sm"
                          variant={isSoldOut ? "outline" : "primary"}
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          {isSoldOut ? "Ver Detalhes" : "Garantir Ingresso"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <span className="text-xs text-zinc-400">
              Página <strong className="text-zinc-200">{page}</strong> de{" "}
              <strong className="text-zinc-200">{totalPages}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
