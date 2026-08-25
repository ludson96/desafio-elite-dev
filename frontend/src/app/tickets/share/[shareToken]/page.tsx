"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  XCircle,
  User,
  Lock,
  Film,
} from "lucide-react";
import { ticketsApi } from "@/services/api";
import type { SharedTicket } from "@/types";
import { formatDateTime, getStatusBadge } from "@/utils/formatters";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ shareToken: string }>;
}

export default function SharedTicketPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const shareToken = resolvedParams.shareToken;

  const [ticket, setTicket] = useState<SharedTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadSharedTicket() {
      try {
        const response: any = await ticketsApi.getSharedTicket(shareToken);
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
        <div className="w-full max-w-md h-96 rounded-3xl bg-zinc-900 border border-zinc-800 animate-pulse" />
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
  const isCanceled = ticket.status === "CANCELED";

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 py-12 bg-zinc-950">
      <div className="w-full max-w-md space-y-6">
        {/* Cabeçalho da Página */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Comprovante Oficial de Ingresso</span>
          </div>
          <h1 className="text-xl font-bold text-white">Elite Ingressos</h1>
        </div>

        {/* Card do Ingresso (Preview / Comprovante Seguro) */}
        <div
          className={`relative bg-zinc-900 border rounded-3xl overflow-hidden shadow-2xl transition-all ${
            isCanceled ? "border-zinc-800/40 opacity-60 grayscale" : "border-zinc-800"
          }`}
        >
          {/* Capa do Evento */}
          <div className="relative h-44 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800">
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
                <Film className="w-10 h-10 opacity-40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />

            <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
          </div>

          {/* Corpo do Comprovante */}
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-white leading-tight">
                {ticket.event?.title || "Evento"}
              </h2>
              {ticket.event?.category && (
                <span className="text-xs text-blue-400 font-medium block">
                  {ticket.event.category}
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300 bg-zinc-950/70 p-4 rounded-2xl border border-zinc-800/80">
              {ticket.event?.date && (
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{formatDateTime(ticket.event.date)}</span>
                </div>
              )}
              {ticket.event?.location && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="line-clamp-1">{ticket.event.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 pt-1 border-t border-zinc-800/60">
                <User className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Titular da Compra: <strong>{ticket.holderName || "Comprador"}</strong>
                </span>
              </div>
            </div>

            {/* Caixa de Segurança Anti-Fraude */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-blue-400">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-200">
                  QR Code Protegido por Criptografia
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Por segurança contra fraudes e revenda não autorizada, o QR Code de entrada oficial fica restrito à área autenticada do titular em <strong>Meus Ingressos</strong>.
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-2 pt-2">
              <Link href="/login" className="block w-full">
                <Button variant="primary" size="md" className="w-full text-xs">
                  Entrar na Minha Conta
                </Button>
              </Link>
              <Link href="/" className="block w-full">
                <Button variant="ghost" size="sm" className="w-full text-xs" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                  Ver Outros Eventos
                </Button>
              </Link>
            </div>
          </div>

          {/* Rodapé Seguro */}
          <div className="p-3.5 bg-zinc-950 border-t border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              Autenticidade Verificada • Elite Ingressos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
