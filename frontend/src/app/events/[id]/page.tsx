"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  ArrowLeft,
  Share2,
  Check,
  CreditCard,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { eventsApi, reservationsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { Event } from "@/types";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isCopied, setIsCopied] = useState(false);

  // Estados do Modal de Checkout Simulado
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSimulationType, setPaymentSimulationType] = useState<"APPROVED" | "REFUSED">("APPROVED");
  const [checkoutError, setCheckoutError] = useState("");

  const eventId = params?.id;

  useEffect(() => {
    let ignore = false;
    const loadEvent = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const response = await eventsApi.getById(eventId);
        if (!ignore) {
          setEvent(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar detalhes do evento:", error);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadEvent();
    return () => {
      ignore = true;
    };
  }, [eventId]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleOpenCheckout = () => {
    if (!isHydrated) return;
    if (!user) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }
    setCheckoutError("");
    setIsCheckoutOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (!event) return;

    setIsProcessing(true);
    setCheckoutError("");

    try {
      // Cria a reserva com a simulação escolhida no modal (APPROVED ou REFUSED)
      await reservationsApi.create({
        eventId: event.id,
        quantity: ticketQuantity,
        paymentStatus: paymentSimulationType,
      });

      setIsProcessing(false);
      setIsCheckoutOpen(false);

      if (paymentSimulationType === "APPROVED") {
        // Redireciona o usuário para a tela dos seus ingressos com QR Code
        router.push("/my-tickets");
      } else {
        // Caso recusado, redireciona para o histórico de compras onde verá a reserva como RECUSADA
        router.push("/my-reservations");
      }
    } catch (err) {
      setIsProcessing(false);
      if (err instanceof Error) {
        setCheckoutError(err.message);
      } else {
        setCheckoutError("Erro ao processar reserva. Tente novamente.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="space-y-3 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Carregando detalhes do evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center space-y-4 max-w-sm px-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
            <Ticket className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Evento não encontrado</h2>
          <p className="text-xs text-zinc-400">
            O evento que você está procurando pode ter sido cancelado ou removido.
          </p>
          <Link href="/">
            <Button variant="outline" size="sm">
              Voltar para a Vitrine
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isSoldOut = event.availableTickets <= 0;
  const totalPrice = Number(event.price) * ticketQuantity;
  const maxAllowedTickets = Math.min(6, event.availableTickets);

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navegação de Retorno */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para eventos
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            leftIcon={
              isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )
            }
          >
            {isCopied ? "Link copiado!" : "Compartilhar Evento"}
          </Button>
        </div>

        {/* Hero do Evento com Imagem Panorâmica */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl h-72 sm:h-96 w-full">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              unoptimized
              priority
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
              <Ticket className="w-16 h-16 opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Badges Flutuantes */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Badge variant={event.type === "SHOW" ? "purple" : "default"}>
              {event.type === "SHOW" ? "Show / Concerto" : "Filme / Cinema"}
            </Badge>
            {event.category && (
              <span className="bg-zinc-950/80 backdrop-blur-xs text-zinc-200 text-xs font-medium px-2.5 py-1 rounded-md border border-white/10">
                {event.category}
              </span>
            )}
          </div>

          {isSoldOut && (
            <div className="absolute top-4 right-4 z-10">
              <Badge variant="danger" size="md">
                Esgotado
              </Badge>
            </div>
          )}
        </div>

        {/* Layout Grid: Informações Principais + Caixa de Compra */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna da Esquerda: Detalhes e Sinopse */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              {/* Informações Principais Limpas & Sóbrias */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <Calendar className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[11px] text-zinc-400 block font-medium">Data e Horário</span>
                    <span className="text-sm font-semibold text-zinc-100">{formatDateTime(event.date)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[11px] text-zinc-400 block font-medium">Localização</span>
                    <span className="text-sm font-semibold text-zinc-100">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição do Evento */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Sobre este evento
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                {event.description ||
                  "Nenhuma descrição detalhada foi informada pelo organizador para este evento."}
              </p>
            </div>

            {/* Organizador */}
            {event.organizer && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-300">
                    {event.organizer.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Organizado por</span>
                    <span className="font-semibold text-zinc-200">{event.organizer.name}</span>
                  </div>
                </div>
                <span className="text-zinc-500">{event.organizer.email}</span>
              </div>
            )}
          </div>

          {/* Coluna da Direita: Card de Compra / Reserva */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <div className="space-y-1 pb-4 border-b border-zinc-800/80">
                <span className="text-xs text-zinc-400">Valor do Ingresso Individual</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {formatCurrency(event.price)}
                  </span>
                  <span className="text-xs text-zinc-400">/ unidade</span>
                </div>
              </div>

              {/* Seletor de Quantidade de Ingressos */}
              {!isSoldOut ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Quantidade de Ingressos:</span>
                      <span className="text-zinc-500">
                        {event.availableTickets} disponíveis
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-zinc-700/80 rounded-lg bg-zinc-950 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setTicketQuantity((q) => Math.max(1, q - 1))}
                          disabled={ticketQuantity <= 1}
                          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          -
                        </button>
                        <span className="w-12 text-center text-sm font-bold text-white">
                          {ticketQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setTicketQuantity((q) => Math.min(maxAllowedTickets, q + 1))}
                          disabled={ticketQuantity >= maxAllowedTickets}
                          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-xs text-zinc-400">
                        Total: <strong className="text-white text-sm">{formatCurrency(totalPrice)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Informação sobre Disponibilidade */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                    <Users className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>
                      Capacidade total: <strong>{event.capacity}</strong> pessoas.
                    </span>
                  </div>

                  {/* Botão de Comprar */}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleOpenCheckout}
                  >
                    Prosseguir para o Pagamento
                  </Button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center space-y-2">
                  <XCircle className="w-6 h-6 mx-auto" />
                  <p className="text-xs font-bold uppercase">Ingressos Esgotados</p>
                  <p className="text-[11px] text-zinc-400">
                    Todos os ingressos para este evento já foram vendidos.
                  </p>
                </div>
              )}

              {/* Informações de Segurança */}
              <div className="pt-2 text-center text-[11px] text-zinc-500 space-y-1 border-t border-zinc-800/80">
                <p>🔒 Transação protegida com simulação imediata.</p>
                <p>🎟️ Emissão do QR Code com assinatura criptográfica.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Pagamento Simulado */}
        <Modal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          title="Checkout Simulado — Elite Ingressos"
          description="Simulação de pagamento sem cobrança financeira real para avaliação do desafio técnico."
          maxWidth="md"
        >
          <div className="space-y-6 py-2">
            {/* Resumo do Pedido */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Evento:</span>
                <span className="font-semibold text-white">{event.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Quantidade:</span>
                <span className="font-semibold text-white">{ticketQuantity}x ingresso(s)</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm">
                <span className="text-zinc-300 font-bold">Total a pagar:</span>
                <span className="text-base font-extrabold text-blue-400">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>

            {/* Escolha do Cenário de Simulação */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-200">
                Escolha o Cenário de Teste do Pagamento:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentSimulationType("APPROVED")}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    paymentSimulationType === "APPROVED"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    ✓ APROVAR Pagamento
                  </span>
                  <span className="text-[10px] text-zinc-400 leading-tight">
                    Debita estoque e emite os ingressos com QR Code
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentSimulationType("REFUSED")}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                    paymentSimulationType === "REFUSED"
                      ? "bg-rose-500/10 border-rose-500 text-rose-400 shadow-sm"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    ✕ RECUSAR Pagamento
                  </span>
                  <span className="text-[10px] text-zinc-400 leading-tight">
                    Simula falha da operadora sem debitar estoque
                  </span>
                </button>
              </div>
            </div>

            {/* Feedback de Erro */}
            {checkoutError && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* Botões de Ação do Modal */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCheckoutOpen(false)}
                disabled={isProcessing}
              >
                Cancelar
              </Button>

              <Button
                variant={paymentSimulationType === "APPROVED" ? "primary" : "danger"}
                size="sm"
                onClick={handleConfirmReservation}
                isLoading={isProcessing}
                leftIcon={<CreditCard className="w-4 h-4" />}
              >
                {paymentSimulationType === "APPROVED"
                  ? "Confirmar e Pagar"
                  : "Simular Recusa de Pagamento"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
