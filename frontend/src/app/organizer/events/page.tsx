"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  DollarSign,
  Users,
  Plus,
  TrendingUp,
  MapPin,
  Clock,
  LayoutDashboard,
  ExternalLink,
} from "lucide-react";
import { eventsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { Event } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
    async function loadEvents() {
      try {
        const response = await eventsApi.getMyEvents();
        if (!ignore) {
          setEvents(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar eventos do organizador:", error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadEvents();
    return () => {
      ignore = true;
    };
  }, [user, isHydrated, router]);

  // Cálculos de Métricas
  const totalRevenue = events.reduce((acc, ev) => {
    const sold = ev.capacity - ev.availableTickets;
    return acc + sold * Number(ev.price);
  }, 0);

  const totalTicketsSold = events.reduce((acc, ev) => {
    return acc + (ev.capacity - ev.availableTickets);
  }, 0);

  const totalCapacity = events.reduce((acc, ev) => acc + ev.capacity, 0);

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Topo do Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-400 font-medium text-xs">
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel de Gestão</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Meus Eventos Publicados</h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Gerencie seus shows e filmes, acompanhe vendas em tempo real e capacidade.
            </p>
          </div>

          <Link href="/organizer/events/new">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Criar Novo Evento
            </Button>
          </Link>
        </div>

        {/* Cards de Métricas e Desempenho */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Total</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white">{formatCurrency(totalRevenue)}</p>
            <p className="text-[11px] text-zinc-400">Receita bruta de ingressos confirmados</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Ingressos Vendidos</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">
              {totalTicketsSold}{" "}
              <span className="text-sm font-normal text-zinc-400">/ {totalCapacity}</span>
            </p>
            <p className="text-[11px] text-zinc-400">Total acumulado de todas as sessões</p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Eventos Ativos</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white">{events.length}</p>
            <p className="text-[11px] text-zinc-400">Shows e filmes cadastrados por você</p>
          </div>
        </div>

        {/* Lista de Eventos Cadastrados */}
        {isLoading ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Carregando seus eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Nenhum evento criado ainda</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Comece publicando um show ou sessão de cinema para abrir a venda de ingressos aos clientes.
              </p>
            </div>
            <Link href="/organizer/events/new">
              <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                Publicar Primeiro Evento
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => {
              const sold = event.capacity - event.availableTickets;
              const percentage = Math.round((sold / event.capacity) * 100);

              return (
                <div
                  key={event.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={event.type === "SHOW" ? "purple" : "default"}>
                        {event.type === "SHOW" ? "Show" : "Cinema"}
                      </Badge>
                      <span className="text-xs font-bold text-emerald-400">
                        {formatCurrency(event.price)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white line-clamp-1">{event.title}</h3>
                      {event.category && (
                        <p className="text-xs text-zinc-400">{event.category}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-zinc-400 pt-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>{formatDateTime(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progresso de Vendas */}
                  <div className="space-y-3 pt-3 border-t border-zinc-800/80">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Ocupação / Vendas</span>
                        <span className="font-semibold text-white">
                          {sold} de {event.capacity} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={`/events/${event.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Ver na Vitrine
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                      <span className="text-[11px] text-zinc-400">
                        Faturamento: <strong>{formatCurrency(sold * Number(event.price))}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
