"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ShieldCheck, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { ticketsApi } from "@/services/api";
import type { Ticket } from "@/types";
import { formatDateTime, getStatusBadge } from "@/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ shareToken: string }>;
}

export default function SharedTicketPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const shareToken = resolvedParams.shareToken;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadSharedTicket() {
      try {
        const response = await ticketsApi.getSharedTicket(shareToken);
        if (!ignore) {
          setTicket(response.data);
        }
      } catch {
        if (!ignore) {
          setError("Ingresso não encontrado ou link expirado.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadSharedTicket();

    return () => {
      ignore = true;
    };
  }, [shareToken]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm h-96 rounded-3xl bg-zinc-900 border border-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-400 mx-auto">
          <XCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Ingresso Não Encontrado</h2>
        <p className="text-xs text-zinc-400 max-w-sm">
          {error || "O link fornecido é inválido ou o ingresso foi revogado."}
        </p>
        <Link href="/">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Ir para a Página Inicial
          </Button>
        </Link>
      </div>
    );
  }

  const badge = getStatusBadge(ticket.status);
  const isUsed = ticket.status === "USED";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 py-12 bg-zinc-950">
      <div className="w-full max-w-sm space-y-6">
        {/* Topo: Identificação Limpa & Sóbria */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Ingresso Autenticado</span>
          </div>
          <h1 className="text-xl font-bold text-white">Elite Ingressos</h1>
        </div>

        {/* Card do Ingresso com Efeito Ticket Stub Sólido */}
        <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Topo do Ticket */}
          <div className="p-6 pb-5 space-y-3 bg-zinc-900 border-b border-dashed border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-400 tracking-wider">
                {ticket.code}
              </span>
              <Badge variant={badge.variant}>
                {badge.label}
              </Badge>
            </div>

            <h2 className="text-lg font-bold text-white leading-snug">
              {ticket.event?.title || "Evento"}
            </h2>

            <div className="space-y-1.5 text-xs text-zinc-400">
              {ticket.event?.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>{formatDateTime(ticket.event.date)}</span>
                </div>
              )}
              {ticket.event?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{ticket.event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Área do QR Code */}
          <div className="p-6 text-center space-y-4">
            <div className="p-3 bg-white rounded-2xl shadow-md inline-block mx-auto border-4 border-zinc-800">
              {ticket.qrCodeUrl ? (
                <Image
                  src={ticket.qrCodeUrl}
                  alt={`QR Code ${ticket.code}`}
                  width={192}
                  height={192}
                  unoptimized
                  className="mx-auto object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-zinc-400 text-xs">
                  Carregando QR Code...
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400 block font-medium">
                Apresente este código na portaria para entrar
              </span>
              {isUsed && ticket.usedAt && (
                <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Utilizado em {formatDateTime(ticket.usedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rodapé do Ticket */}
          <div className="p-4 bg-zinc-950 border-t border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
              HMAC-SHA256 • Verificação Criptográfica Ativa
            </span>
          </div>
        </div>

        {/* Link para Vitrine */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Conhecer a Elite Ingressos
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
