"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ticket as TicketIcon,
  Calendar,
  MapPin,
  Share2,
  Check,
  QrCode,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { ticketsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { Ticket } from "@/types";
import { formatDateTime, getStatusBadge } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.push("/login?redirect=/my-tickets");
      return;
    }

    let ignore = false;

    async function loadTickets() {
      try {
        const response = await ticketsApi.getMyTickets();
        if (!ignore) {
          setTickets(response.data);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Erro ao carregar ingressos:", error);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTickets();

    return () => {
      ignore = true;
    };
  }, [user, isHydrated, router]);

  const handleCopyShareLink = (shareToken: string) => {
    const shareUrl = `${window.location.origin}/tickets/share/${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedToken(shareToken);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <TicketIcon className="w-7 h-7 text-blue-400" />
              Meus Ingressos
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Acesse seus ingressos autenticados com QR Code para entrada ou envie o link para amigos.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Ver Mais Eventos
            </Button>
          </Link>
        </div>

        {/* Listagem de Ingressos */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500">
              <TicketIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-zinc-200">Você ainda não possui ingressos</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Explore a vitrine de eventos e garanta sua entrada agora mesmo.
              </p>
            </div>
            <Link href="/">
              <Button size="sm">Explorar Eventos</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => {
              const badge = getStatusBadge(ticket.status);
              const isUsed = ticket.status === "USED";

              return (
                <div
                  key={ticket.id}
                  className={`relative bg-zinc-900/90 border rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5 transition-all overflow-hidden ${
                    isUsed ? "border-zinc-800 opacity-75" : "border-zinc-700 hover:border-blue-500/50"
                  }`}
                >
                  {/* Linha Decorativa Superior */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                      isUsed ? "from-purple-600 to-zinc-700" : "from-blue-500 via-indigo-500 to-blue-600"
                    }`}
                  />

                  {/* Informações do Ingresso */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-xs text-blue-400 font-bold tracking-wider">
                        {ticket.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white line-clamp-1">
                      {ticket.event?.title || "Evento"}
                    </h3>

                    <div className="space-y-1.5 text-xs text-zinc-400">
                      {ticket.event?.date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span>{formatDateTime(ticket.event.date)}</span>
                        </div>
                      )}
                      {ticket.event?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span className="line-clamp-1">{ticket.event.location}</span>
                        </div>
                      )}
                    </div>

                    {isUsed && ticket.usedAt && (
                      <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px]">
                        Utilizado na portaria em: <strong>{formatDateTime(ticket.usedAt)}</strong>
                      </div>
                    )}
                  </div>

                  {/* Ações: QR Code e Compartilhar */}
                  <div className="space-y-2 pt-3 border-t border-zinc-800">
                    <Button
                      variant={isUsed ? "secondary" : "primary"}
                      size="sm"
                      className="w-full"
                      leftIcon={<QrCode className="w-4 h-4" />}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      {isUsed ? "Ver Histórico do QR Code" : "Apresentar QR Code"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      leftIcon={
                        copiedToken === ticket.shareToken ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )
                      }
                      onClick={() => handleCopyShareLink(ticket.shareToken)}
                    >
                      {copiedToken === ticket.shareToken ? "Link Copiado!" : "Compartilhar Link"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Exibição do QR Code */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Ingresso Digital & QR Code"
        description="Apresente este QR Code na portaria do evento para validação imediata."
        maxWidth="sm"
      >
        {selectedTicket && (
          <div className="space-y-5 text-center">
            {/* Box do QR Code */}
            <div className="p-4 bg-white rounded-2xl shadow-inner inline-block mx-auto border-4 border-zinc-800">
              {selectedTicket.qrCodeUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedTicket.qrCodeUrl}
                  alt={`QR Code ${selectedTicket.code}`}
                  className="w-56 h-56 mx-auto object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-zinc-400 text-xs">
                  Carregando QR Code...
                </div>
              )}
            </div>

            {/* Código e Evento */}
            <div className="space-y-1">
              <span className="font-mono text-sm font-bold text-white bg-zinc-950 px-3 py-1 rounded-lg border border-zinc-800 inline-block">
                {selectedTicket.code}
              </span>
              <h4 className="text-sm font-semibold text-zinc-200 pt-1">
                {selectedTicket.event?.title}
              </h4>
              <p className="text-xs text-zinc-400">
                {selectedTicket.event?.date && formatDateTime(selectedTicket.event.date)}
              </p>
            </div>

            {/* Aviso Anti-Fraude */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Assinatura HMAC-SHA256 verificada e anti-duplicação</span>
            </div>

            {/* Link de Compartilhamento */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={
                  copiedToken === selectedTicket.shareToken ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )
                }
                onClick={() => handleCopyShareLink(selectedTicket.shareToken)}
              >
                {copiedToken === selectedTicket.shareToken
                  ? "Link Copiado para Envio!"
                  : "Copiar Link Público do Ingresso"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
