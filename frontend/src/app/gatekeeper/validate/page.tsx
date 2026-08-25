"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  Keyboard,
  ShieldCheck,  
  Calendar,
  Clock,
  History,
  RotateCcw,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { eventsApi, ticketsApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { Event, TicketValidationResult } from "@/types";
import { formatDateTime } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

export default function GatekeeperValidatePage() {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [ticketCode, setTicketCode] = useState("");
  const [validationResult, setValidationResult] = useState<TicketValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [mode, setMode] = useState<"MANUAL" | "CAMERA">("MANUAL");
  const [recentScans, setRecentScans] = useState<
    Array<{ code: string; result: TicketValidationResult; time: string }>
  >([]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || (user.role !== "GATEKEEPER" && user.role !== "ORGANIZER")) {
      router.push("/login?redirect=/gatekeeper/validate");
      return;
    }

    let ignore = false;
    async function loadEvents() {
      try {
        const response = await eventsApi.list({ limit: 50, status: "PUBLISHED" });
        if (!ignore) {
          setEvents(response.data.events);
          if (response.data.events.length > 0) {
            setSelectedEventId(response.data.events[0].id);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar eventos para portaria:", error);
      }
    }
    loadEvents();
    return () => {
      ignore = true;
    };
  }, [user, isHydrated, router]);

  const handleValidateTicket = useCallback(
    async (code: string, signature?: string) => {
      if (!code.trim() || !selectedEventId) return;

      setIsValidating(true);
      setValidationResult(null);

      try {
        const response = await ticketsApi.validate({
          code: code.trim(),
          eventId: selectedEventId,
          signature,
        });

        const result = response.data;
        setValidationResult(result);
        setRecentScans((prev) => [
          { code: code.trim(), result, time: new Date().toLocaleTimeString("pt-BR") },
          ...prev.slice(0, 9),
        ]);
        setTicketCode("");
      } catch (err) {
        if (err instanceof Error) {
          setValidationResult({
            valid: false,
            status: "INVALID",
            message: err.message,
          });
        }
      } finally {
        setIsValidating(false);
      }
    },
    [selectedEventId]
  );

  // Inicialização do Scanner de Câmera
  useEffect(() => {
    if (mode !== "CAMERA" || !selectedEventId) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        try {
          let code = decodedText;
          let signature: string | undefined;

          if (decodedText.startsWith("{")) {
            const parsed = JSON.parse(decodedText);
            code = parsed.code || decodedText;
            signature = parsed.signature;
          }

          scanner.clear();
          setMode("MANUAL");
          handleValidateTicket(code, signature);
        } catch {
          scanner.clear();
          setMode("MANUAL");
          handleValidateTicket(decodedText);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [mode, selectedEventId, handleValidateTicket]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="flex-1 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cabeçalho */}
        <div className="space-y-1 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Controle de Acesso & Portaria</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-blue-500" />
            Validação de Ingressos
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Escaneie o QR Code ou digite o código do ingresso para liberar a entrada do participante.
          </p>
        </div>

        {/* Seletor de Evento */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-2">
          <label className="block text-xs font-semibold text-zinc-300">
            Selecione o Evento que está sendo controlado na Portaria:
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setValidationResult(null);
            }}
            className="w-full h-11 px-3 bg-zinc-950 text-zinc-100 rounded-lg border border-zinc-700/80 focus:outline-none focus:border-blue-500 text-sm font-medium"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} — ({formatDateTime(ev.date)})
              </option>
            ))}
          </select>

          {selectedEvent && (
            <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {formatDateTime(selectedEvent.date)}
              </span>
              <span>Capacidade: {selectedEvent.capacity} pessoas</span>
            </div>
          )}
        </div>

        {/* Alternador de Modo: Câmera ou Manual */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMode("MANUAL")}
            className={cn(
              "p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all",
              mode === "MANUAL"
                ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            )}
          >
            <Keyboard className="w-4 h-4" />
            Digitação Manual de Código
          </button>

          <button
            type="button"
            onClick={() => setMode("CAMERA")}
            className={cn(
              "p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all",
              mode === "CAMERA"
                ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            )}
          >
            <Camera className="w-4 h-4" />
            Scanner por Câmera (QR Code)
          </button>
        </div>

        {/* Box da Câmera */}
        {mode === "CAMERA" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <h3 className="text-sm font-bold text-white">Aponte a câmera para o QR Code do ingresso</h3>
            <div id="qr-reader" className="mx-auto overflow-hidden rounded-xl max-w-sm" />
            <Button variant="outline" size="sm" onClick={() => setMode("MANUAL")}>
              Cancelar Câmera
            </Button>
          </div>
        )}

        {/* Box de Digitação Manual */}
        {mode === "MANUAL" && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleValidateTicket(ticketCode);
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex-1">
                <Input
                  placeholder="Ex: TKT-CP-001-ANA"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                  required
                  leftIcon={<QrCode className="w-4 h-4" />}
                  className="font-mono text-sm uppercase bg-zinc-950"
                />
              </div>
              <Button type="submit" size="md" variant="primary" isLoading={isValidating}>
                Validar Ingresso
              </Button>
            </form>
          </div>
        )}

        {/* Resultado Visual da Validação */}
        {validationResult && (
          <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4 shadow-2xl">
            <div className="inline-flex p-4 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-md mx-auto">
              {validationResult.status === "VALID" && <CheckCircle2 className="w-10 h-10 text-emerald-400" />}
              {validationResult.status === "ALREADY_USED" && <RotateCcw className="w-10 h-10 text-purple-400" />}
              {validationResult.status === "WRONG_EVENT" && <AlertTriangle className="w-10 h-10 text-amber-400" />}
              {validationResult.status === "INVALID" && <XCircle className="w-10 h-10 text-rose-400" />}
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-extrabold text-white">
                {validationResult.status === "VALID" && "ENTRADA LIBERADA!"}
                {validationResult.status === "ALREADY_USED" && "INGRESSO JÁ UTILIZADO!"}
                {validationResult.status === "WRONG_EVENT" && "EVENTO INCORRETO!"}
                {validationResult.status === "INVALID" && "INGRESSO INVÁLIDO!"}
              </h2>
              <p className="text-sm text-zinc-300 font-medium">{validationResult.message}</p>
            </div>

            {validationResult.ticket && (
              <div className="max-w-md mx-auto p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-left text-xs space-y-2 text-zinc-300">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Código do Ingresso:</span>
                  <span className="font-mono font-bold text-white">{validationResult.ticket.code}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Evento:</span>
                  <span className="font-semibold text-white truncate max-w-50">
                    {validationResult.ticket.event?.title}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Histórico Recente de Leituras */}
        {recentScans.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              Últimas Leituras Realizadas
            </h3>
            <div className="divide-y divide-zinc-800/80">
              {recentScans.map((scan, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-zinc-300">{scan.code}</span>
                    <span className="text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {scan.time}
                    </span>
                  </div>
                  <Badge
                    variant={
                      scan.result.status === "VALID"
                        ? "success"
                        : scan.result.status === "ALREADY_USED"
                        ? "purple"
                        : scan.result.status === "WRONG_EVENT"
                        ? "warning"
                        : "danger"
                    }
                    size="sm"
                  >
                    {scan.result.status === "VALID" && "Válido"}
                    {scan.result.status === "ALREADY_USED" && "Já Utilizado"}
                    {scan.result.status === "WRONG_EVENT" && "Evento Incorreto"}
                    {scan.result.status === "INVALID" && "Inválido"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
