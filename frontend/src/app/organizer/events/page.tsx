"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  PlusCircle,
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { eventsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { Event } from "@/types";
import { formatCurrency, formatDateTime, getStatusBadge } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user || user.role !== "ORGANIZER") {
      router.push("/login?redirect=/organizer/events");
      return;
    }

    let ignore = false;

    async function loadOrganizerEvents() {
      try {
        const response = await eventsApi.getMyEvents();
        if (!ignore) {
          setEvents(response.data);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Erro ao carregar eventos do organizador:", error);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadOrganizerEvents();

    return () => {
      ignore = true;
    };
  }, [user, isHydrated, router]);

  // Cálculos de métricas
  const totalEvents = events.length;
  const totalCapacity = events.reduce((acc, ev) => acc + ev.capacity, 0);
  const totalSold = events.reduce((acc, ev) => acc + (ev.capacity - ev.availableTickets), 0);
  const totalRevenue = events.reduce(
    (acc, ev) => acc + (ev.capacity - ev.availableTickets) * Number(ev.price),
    0
  );

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Calendar className="w-7 h-7 text-indigo-400" />
              Painel do Organizador
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Gerencie seus shows e filmes, acompanhe as vendas de ingressos em tempo real e publique novos eventos.
            </p>
          </div>
          <Link href="/organizer/events/new">
            <Button variant="primary" size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Criar Novo Evento
            </Button>
          </Link>
        </div>

        {/* Cards de Métricas em Destaque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Eventos Criados</span>
              <Calendar className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">{totalEvents}</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Ingressos Vendidos</span>
              <Ticket className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">{totalSold}</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Capacidade Total</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">{totalCapacity}</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium">
              <span>Faturamento Estimado</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        {/* Listagem de Eventos */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Meus Eventos Publicados
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-zinc-200">Você ainda não possui eventos cadastrados</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Crie seu primeiro evento usando nosso assistente integrado aos catálogos do TMDb e Ticketmaster.
                </p>
              </div>
              <Link href="/organizer/events/new">
                <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                  Criar Primeiro Evento
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => {
                const badge = getStatusBadge(event.status);
                const soldCount = event.capacity - event.availableTickets;
                const percentage = Math.round((soldCount / event.capacity) * 100);

                return (
                  <div
                    key={event.id}
                    className="bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                          {event.type === "SHOW" ? "Show" : "Filme"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white line-clamp-1">{event.title}</h3>

                      <div className="space-y-1 text-xs text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span>{formatDateTime(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso de Vendas */}
                    <div className="space-y-1.5 pt-3 border-t border-zinc-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">
                          Vendas: <strong className="text-white">{soldCount}</strong> / {event.capacity}
                        </span>
                        <span className="text-blue-400 font-semibold">{percentage}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Rodapé do Card */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Preço</span>
                        <span className="text-sm font-bold text-white">{formatCurrency(event.price)}</span>
                      </div>

                      <Link href={`/events/${event.id}`}>
                        <Button size="sm" variant="ghost" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Ver na Vitrine
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
