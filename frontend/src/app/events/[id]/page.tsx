"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Ticket,
  User as UserIcon,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EventDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Estados do Modal de Checkout
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentOutcome, setPaymentOutcome] = useState<{
    status: "APPROVED" | "REFUSED";
    message: string;
  } | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadEvent() {
      try {
        const response = await eventsApi.getById(eventId);
        if (!ignore) {
          setEvent(response.data);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Erro ao buscar evento:", error);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadEvent();

    return () => {
      ignore = true;
    };
  }, [eventId]);

  const handleOpenCheckout = () => {
    if (!user) {
      router.push(`/login?redirect=/events/${eventId}`);
      return;
    }
    setPaymentOutcome(null);
    setCheckoutError("");
    setIsCheckoutModalOpen(true);
  };

  const handleExecutePayment = async (status: "APPROVED" | "REFUSED") => {
    setIsProcessingPayment(true);
    setCheckoutError("");

    try {
      const response = await reservationsApi.create({
        eventId,
        quantity,
        paymentStatus: status,
      });

      setPaymentOutcome({
        status: status,
        message: response.data.paymentOutcome.message,
      });

      // Atualiza o estoque local do evento
      if (status === "APPROVED" && event) {
        setEvent({
          ...event,
          availableTickets: Math.max(0, event.availableTickets - quantity),
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setCheckoutError(err.message);
      } else {
        setCheckoutError("Erro ao processar reserva.");
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 w-full animate-pulse space-y-6">
        <div className="h-6 w-32 bg-zinc-800 rounded" />
        <div className="h-72 w-full bg-zinc-900 rounded-2xl" />
        <div className="h-40 w-full bg-zinc-900 rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Evento não encontrado</h2>
        <p className="text-sm text-zinc-400">Este evento pode ter sido removido ou não existe.</p>
        <Link href="/">
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Voltar para Eventos
          </Button>
        </Link>
      </div>
    );
  }

  const isSoldOut = event.availableTickets <= 0;
  const totalPrice = Number(event.price) * quantity;

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Botão Voltar */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para todos os eventos
        </Link>

        {/* Banner do Evento com Next Image */}
        <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-zinc-900 to-zinc-800 text-zinc-600">
              <Ticket className="w-16 h-16 opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

          {/* Badges Flutuantes */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Badge variant={event.type === "SHOW" ? "purple" : "default"}>
              {event.type === "SHOW" ? "Show / Concerto" : "Filme / Cinema"}
            </Badge>
            {event.category && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/60 backdrop-blur-md text-zinc-200 border border-white/10">
                {event.category}
              </span>
            )}
          </div>
        </div>

        {/* Conteúdo Principal (Grid 2 Colunas) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda: Informações e Descrição */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Data e Horário</span>
                    <span className="text-sm font-semibold text-zinc-100">{formatDateTime(event.date)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                  <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Local</span>
                    <span className="text-sm font-semibold text-zinc-100">{event.location}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição */}
            {event.description && (
              <div className="space-y-3 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
                <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Sobre o Evento</h3>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            )}

            {/* Organizador */}
            {event.organizer && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/60">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Organizado por</span>
                  <span className="text-sm font-medium text-zinc-200">{event.organizer.name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita: Caixa de Compra / Checkout */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6">
              <div>
                <span className="text-xs text-zinc-400 block">Preço por ingresso</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-white">{formatCurrency(event.price)}</span>
                  <span className="text-xs text-zinc-500">/ unidade</span>
                </div>
              </div>

              {/* Disponibilidade de Estoque */}
              <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Status do Estoque:</span>
                  <Badge variant={isSoldOut ? "danger" : "success"}>
                    {isSoldOut ? "Esgotado" : `${event.availableTickets} restantes`}
                  </Badge>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all"
                    style={{
                      width: `${Math.min(100, (event.availableTickets / event.capacity) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Seletor de Quantidade */}
              {!isSoldOut && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-300 block">Quantidade de Ingressos:</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-lg flex items-center justify-center transition-colors disabled:opacity-30"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-lg text-white bg-zinc-950 py-2 rounded-lg border border-zinc-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(event.availableTickets, quantity + 1))}
                      className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-lg flex items-center justify-center transition-colors disabled:opacity-30"
                      disabled={quantity >= event.availableTickets}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Valor Total */}
              {!isSoldOut && (
                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Total a Pagar:</span>
                  <span className="text-xl font-extrabold text-blue-400">{formatCurrency(totalPrice)}</span>
                </div>
              )}

              {/* Botão de Ação */}
              {isSoldOut ? (
                <Button variant="outline" className="w-full" disabled>
                  Ingressos Esgotados
                </Button>
              ) : isHydrated && user?.role === "ORGANIZER" ? (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center">
                  Você está logado como Organizador. Acesse como Cliente para comprar.
                </div>
              ) : (
                <Button size="lg" className="w-full" onClick={handleOpenCheckout}>
                  {user ? "Comprar Agora" : "Entrar para Comprar"}
                </Button>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulação segura com proteção contra overbooking</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Checkout Simulado */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => !isProcessingPayment && setIsCheckoutModalOpen(false)}
        title="Checkout e Simulação de Pagamento"
        description="Escolha o resultado da simulação para validar o comportamento da plataforma."
        maxWidth="md"
      >
        <div className="space-y-6">
          {/* Resumo da Compra */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <h4 className="text-sm font-semibold text-white">{event.title}</h4>
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>
                {quantity}x Ingressos ({formatCurrency(event.price)})
              </span>
              <strong className="text-zinc-200 font-semibold">{formatCurrency(totalPrice)}</strong>
            </div>
          </div>

          {/* Feedback de Erro */}
          {checkoutError && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {/* Feedback do Resultado do Pagamento */}
          {paymentOutcome ? (
            <div
              className={`p-5 rounded-2xl border text-center space-y-3 animate-in zoom-in-95 duration-200 ${
                paymentOutcome.status === "APPROVED"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              <div className="inline-flex p-3 rounded-full bg-zinc-900 shadow-md mx-auto">
                {paymentOutcome.status === "APPROVED" ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">
                  {paymentOutcome.status === "APPROVED" ? "Pagamento Aprovado!" : "Pagamento Recusado!"}
                </h4>
                <p className="text-xs text-zinc-300">{paymentOutcome.message}</p>
              </div>

              <div className="pt-2">
                {paymentOutcome.status === "APPROVED" ? (
                  <Link href="/my-tickets">
                    <Button size="sm" variant="primary" className="w-full">
                      Ver Meus Ingressos com QR Code
                    </Button>
                  </Link>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setPaymentOutcome(null)}
                  >
                    Tentar Novamente
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Botões de Simulação */
            <div className="space-y-3">
              <span className="text-xs text-zinc-400 block font-medium">
                Escolha o cenário que deseja testar:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => handleExecutePayment("APPROVED")}
                  className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovar Pagamento</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Emite os ingressos com HMAC e debita o estoque.
                  </p>
                </button>

                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={() => handleExecutePayment("REFUSED")}
                  className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-left transition-all group disabled:opacity-50"
                >
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-1">
                    <XCircle className="w-4 h-4" />
                    <span>Recusar Pagamento</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Simula falha da operadora sem alterar o estoque.
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
