"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Ticket as TicketIcon,
  QrCode,
  Calendar,
  MapPin,
  Clock,
  Share2,
  Check,
  Film,
  ExternalLink,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { ticketsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { Ticket } from "@/types";
import { formatDateTime, getStatusBadge } from "@/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function MyTicketsPage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
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
        console.error("Erro ao carregar ingressos:", error);
      } finally {
        if (!ignore) setLoading(false);
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
    setTimeout(() => {
      setCopiedToken(null);
    }, 2500);
  };

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800/80">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <TicketIcon className="w-7 h-7 text-blue-500" />
              Meus Ingressos Digitais
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Apresente o QR Code na portaria ou compartilhe o link seguro de acesso.
            </p>
          </div>
          <Link href="/my-reservations">
            <Button variant="outline" size="sm">
              Ver Histórico de Compras
            </Button>
          </Link>
        </div>

        {/* Listagem de Ingressos */}
        {loading ? (
          <div className="text-center py-20 space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Carregando seus ingressos...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
              <TicketIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Nenhum ingresso encontrado</h3>
              <p className="text-xs text-zinc-400">
                Você ainda não possui ingressos emitidos.
              </p>
            </div>
            <Link href="/">
              <Button variant="primary" size="md">
                Explorar Eventos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => {
              const isUsed = ticket.status === "USED";
              const isCanceled = ticket.status === "CANCELED";
              const isCopied = copiedToken === ticket.shareToken;
              const badge = getStatusBadge(ticket.status);

              return (
                <div
                  key={ticket.id}
                  className={`bg-zinc-900 border rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all ${
                    isCanceled
                      ? "border-zinc-800/40 opacity-50 grayscale"
                      : isUsed
                      ? "border-zinc-800/60 opacity-70"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  {/* Capa do Evento no Topo do Card */}
                  <div className="relative h-36 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800/80">
                    {ticket.event?.imageUrl ? (
                      <Image
                        src={ticket.event.imageUrl}
                        alt={ticket.event?.title || "Evento"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-600">
                        <Film className="w-8 h-8 opacity-40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-zinc-900 via-zinc-900/30 to-transparent" />

                    {/* Status Flutuante */}
                    <div className="absolute top-3 left-3 z-10">
                      <Badge variant={badge.variant}>
                        {badge.label}
                      </Badge>
                    </div>

                    {/* Código do Ticket */}
                    <div className={`absolute bottom-2 right-3 z-10 font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                      isCanceled
                        ? "text-zinc-500 bg-zinc-950/90 border-zinc-800 line-through"
                        : "text-blue-400 bg-zinc-950/80 border-white/10"
                    }`}>
                      {ticket.code}
                    </div>
                  </div>

                  {/* Corpo do Card */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-white line-clamp-1">
                        {ticket.event?.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-zinc-400">
                        {ticket.event?.date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{formatDateTime(ticket.event.date)}</span>
                          </div>
                        )}
                        {ticket.event?.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="line-clamp-1">{ticket.event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações do Ingresso */}
                    <div className="space-y-2 pt-3 border-t border-zinc-800/80">
                      {isCanceled ? (
                        <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-500 font-medium">
                          <Ban className="w-4 h-4 text-zinc-600" />
                          <span>Ingresso Cancelado / Inativo</span>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant={isUsed ? "secondary" : "primary"}
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedTicket(ticket)}
                            leftIcon={<QrCode className="w-4 h-4" />}
                          >
                            {isUsed ? "Ver QR Code (Utilizado)" : "Apresentar QR Code"}
                          </Button>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyShareLink(ticket.shareToken)}
                              leftIcon={
                                isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Share2 className="w-3.5 h-3.5" />
                                )
                              }
                              className="text-xs"
                            >
                              {isCopied ? "Copiado!" : "Compartilhar"}
                            </Button>

                            <Link
                              href={`/tickets/share/${ticket.shareToken}`}
                              target="_blank"
                              className="w-full"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                rightIcon={<ExternalLink className="w-3 h-3" />}
                              >
                                Ver Link
                              </Button>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Exibição do QR Code */}
        {selectedTicket && (
          <Modal
            isOpen={Boolean(selectedTicket)}
            onClose={() => setSelectedTicket(null)}
            title="Ingresso Digital & QR Code"
            description="Apresente este código para leitura na entrada do evento."
            maxWidth="md"
          >
            <div className="text-center space-y-5 py-2">
              {/* Box do QR Code */}
              <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
                {selectedTicket.qrCodeUrl || selectedTicket.qrCode ? (
                  <Image
                    src={selectedTicket.qrCodeUrl || selectedTicket.qrCode || ""}
                    alt={`QR Code do ingresso ${selectedTicket.code}`}
                    width={220}
                    height={220}
                    unoptimized
                    className="rounded-lg mx-auto"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-zinc-400">
                    <QrCode className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* Informações Resumidas */}
              <div className="space-y-1">
                <p className="font-mono text-sm font-bold text-blue-400">
                  {selectedTicket.code}
                </p>
                <h4 className="text-base font-bold text-white">
                  {selectedTicket.event?.title}
                </h4>
                {selectedTicket.event?.date && (
                  <p className="text-xs text-zinc-400 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(selectedTicket.event.date)}
                  </p>
                )}
              </div>

              {/* Aviso Anti-Fraude */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Assinatura criptográfica HMAC-SHA256 verificada</span>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleCopyShareLink(selectedTicket.shareToken)}
                >
                  {copiedToken === selectedTicket.shareToken
                    ? "Link de Compartilhamento Copiado!"
                    : "Copiar Link Público do Ingresso"}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}
