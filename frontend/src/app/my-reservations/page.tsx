"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Calendar,
  Ticket,
  X,
} from "lucide-react";
import { reservationsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { Reservation } from "@/types";
import { formatCurrency, formatDateTime, getStatusBadge } from "@/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function MyReservationsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para modal de cancelamento
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

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
        console.error("Erro ao carregar histórico de compras:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadReservations();
    return () => {
      ignore = true;
    };
  }, [user, isHydrated, router]);

  const handleOpenCancelModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setCancelError("");
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedReservation) return;

    setIsCanceling(true);
    setCancelError("");

    try {
      await reservationsApi.cancel(selectedReservation.id);

      // Atualiza o estado da listagem localmente
      setReservations((prev) =>
        prev.map((r) => (r.id === selectedReservation.id ? { ...r, status: "CANCELED" } : r))
      );

      setIsCancelModalOpen(false);
      setSelectedReservation(null);
      setFeedbackMessage("Reserva cancelada com sucesso.");

      setTimeout(() => {
        setFeedbackMessage("");
      }, 5000);
    } catch (err) {
      if (err instanceof Error) {
        setCancelError(err.message);
      } else {
        setCancelError("Erro ao cancelar a reserva. Tente novamente.");
      }
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <ShoppingBag className="w-7 h-7 text-blue-500" />
              Minhas Compras & Reservas
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Acompanhe o status dos seus pedidos, pagamentos e emissões.
            </p>
          </div>
          <Link href="/my-tickets">
            <Button variant="outline" size="sm" leftIcon={<Ticket className="w-4 h-4" />}>
              Acessar Meus Ingressos
            </Button>
          </Link>
        </div>

        {/* Feedback Sóbrio e Discreto */}
        {feedbackMessage && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage("")}
              className="text-zinc-400 hover:text-zinc-200 p-1 transition-colors"
              aria-label="Fechar mensagem"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Listagem */}
        {loading ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Carregando histórico de compras...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Nenhuma compra encontrada</h3>
              <p className="text-xs text-zinc-400">
                Você ainda não realizou compras de ingressos na plataforma.
              </p>
            </div>
            <Link href="/">
              <Button variant="primary" size="md">
                Ver Eventos Disponíveis
              </Button>
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
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 sm:p-6 shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Badge variant={badge.variant}>
                        {badge.label}
                      </Badge>
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
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{formatDateTime(reservation.event.date)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-zinc-400" />
                        <span>
                          {reservation.quantity} {reservation.quantity === 1 ? "ingresso" : "ingressos"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">
                        Total {isConfirmed ? "Pago" : "do Pedido"}
                      </span>
                      <span className="text-lg font-extrabold text-white">
                        {formatCurrency(reservation.totalAmount)}
                      </span>
                    </div>

                    {isConfirmed && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-rose-400 hover:text-rose-300 hover:border-rose-800"
                          onClick={() => handleOpenCancelModal(reservation)}
                        >
                          Cancelar Reserva
                        </Button>
                        <Link href="/my-tickets">
                          <Button variant="primary" size="sm" className="text-xs">
                            Ver Ingressos
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Confirmação de Cancelamento */}
        <Modal
          isOpen={isCancelModalOpen}
          onClose={() => {
            if (!isCanceling) setIsCancelModalOpen(false);
          }}
          title="Confirmar Cancelamento de Reserva"
        >
          <div className="space-y-5">
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <p className="font-medium text-zinc-200">Tem certeza que deseja cancelar esta reserva?</p>
              <p>Os {selectedReservation?.quantity} ingressos vinculados serão invalidados permanentemente.</p>
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-rose-900/60 text-xs text-rose-300">
                {cancelError}
              </div>
            )}

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Evento:</span>
                <span className="font-medium text-white">{selectedReservation?.event?.title}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Quantidade:</span>
                <span className="font-medium text-white">{selectedReservation?.quantity} ingressos</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Valor Total:</span>
                <span className="font-medium text-white">
                  {selectedReservation && formatCurrency(selectedReservation.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCanceling}
              >
                Voltar
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmCancel}
                isLoading={isCanceling}
              >
                Confirmar Cancelamento
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
