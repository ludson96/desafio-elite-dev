"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Calendar, Ticket, ArrowRight } from "lucide-react";
import { reservationsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { Reservation } from "@/types";
import { formatCurrency, formatDateTime, getStatusBadge } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";

export default function MyReservationsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.push("/login?redirect=/my-reservations");
      return;
    }

    let ignore = false;

    async function loadReservations() {
      try {
        const response = await reservationsApi.getMyReservations();
        if (!ignore) {
          setReservations(response.data);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Erro ao carregar reservas:", error);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadReservations();

    return () => {
      ignore = true;
    };
  }, [user, isHydrated, router]);

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-blue-400" />
              Minhas Compras
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Histórico de pedidos, simulações de pagamento e reservas de ingressos.
            </p>
          </div>
          <Link href="/my-tickets">
            <Button variant="outline" size="sm" leftIcon={<Ticket className="w-4 h-4 text-blue-400" />}>
              Acessar Meus Ingressos
            </Button>
          </Link>
        </div>

        {/* Listagem de Compras */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse" />
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-zinc-200">Nenhum pedido encontrado</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Você ainda não realizou nenhuma compra de ingressos.
              </p>
            </div>
            <Link href="/">
              <Button size="sm">Comprar Ingressos</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const badge = getStatusBadge(reservation.status);
              const isConfirmed = reservation.status === "CONFIRMED";

              return (
                <div
                  key={reservation.id}
                  className="bg-zinc-900/80 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 sm:p-6 shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-zinc-400">
                        Pedido realizado em {formatDateTime(reservation.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {reservation.event?.title || "Evento"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                      {reservation.event?.date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span>{formatDateTime(reservation.event.date)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-indigo-400" />
                        <span>
                          {reservation.quantity} {reservation.quantity === 1 ? "ingresso" : "ingressos"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                        Valor Total
                      </span>
                      <span className="text-lg font-bold text-white">
                        {formatCurrency(reservation.totalAmount)}
                      </span>
                    </div>

                    {isConfirmed && (
                      <Link href="/my-tickets" className="mt-2">
                        <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                          Ver Ingressos
                        </Button>
                      </Link>
                    )}
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
