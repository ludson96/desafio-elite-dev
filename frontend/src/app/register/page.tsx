"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User as UserIcon, Mail, Lock, ArrowRight, ShieldCheck, Ticket, Calendar, QrCode } from "lucide-react";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils/cn";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "ORGANIZER" | "GATEKEEPER">("CLIENT");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await authApi.register({ name, email, password, role });
      const { user, token } = response.data;
      setAuth(user, token);

      if (user.role === "ORGANIZER") {
        router.push("/organizer/events");
      } else if (user.role === "GATEKEEPER") {
        router.push("/gatekeeper/validate");
      } else {
        router.push("/");
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro ao cadastrar. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-500 items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Criar Nova Conta</h1>
          <p className="text-sm text-zinc-400">
            Cadastre-se para aproveitar todos os recursos da Elite Ingressos.
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome Completo"
              type="text"
              placeholder="Ex: João da Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              leftIcon={<UserIcon className="w-4 h-4" />}
            />

            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            {/* Seleção do Tipo de Perfil */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-zinc-300">
                Selecione o seu Tipo de Perfil:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Opção Cliente */}
                <button
                  type="button"
                  onClick={() => setRole("CLIENT")}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5",
                    role === "CLIENT"
                      ? "bg-blue-600/10 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/40"
                      : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                  )}
                >
                  <Ticket className={cn("w-4 h-4", role === "CLIENT" ? "text-blue-400" : "text-zinc-500")} />
                  <span className="text-xs font-semibold text-zinc-200">Cliente</span>
                  <span className="text-[10px] text-zinc-400 leading-tight">Comprar ingressos e curtir</span>
                </button>

                {/* Opção Organizador */}
                <button
                  type="button"
                  onClick={() => setRole("ORGANIZER")}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5",
                    role === "ORGANIZER"
                      ? "bg-indigo-600/10 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40"
                      : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                  )}
                >
                  <Calendar className={cn("w-4 h-4", role === "ORGANIZER" ? "text-indigo-400" : "text-zinc-500")} />
                  <span className="text-xs font-semibold text-zinc-200">Organizador</span>
                  <span className="text-[10px] text-zinc-400 leading-tight">Criar eventos e vender</span>
                </button>

                {/* Opção Portaria */}
                <button
                  type="button"
                  onClick={() => setRole("GATEKEEPER")}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5",
                    role === "GATEKEEPER"
                      ? "bg-emerald-600/10 border-emerald-500 text-white shadow-sm ring-1 ring-emerald-500/40"
                      : "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
                  )}
                >
                  <QrCode className={cn("w-4 h-4", role === "GATEKEEPER" ? "text-emerald-400" : "text-zinc-500")} />
                  <span className="text-xs font-semibold text-zinc-200">Portaria</span>
                  <span className="text-[10px] text-zinc-400 leading-tight">Validar entradas no evento</span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Criar Conta e Começar
            </Button>
          </form>
        </div>

        {/* Link para Login */}
        <p className="text-center text-xs text-zinc-400">
          Já tem uma conta cadastrada?{" "}
          <Link
            href="/login"
            className="text-blue-400 hover:text-blue-300 font-medium underline-offset-4 hover:underline"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
