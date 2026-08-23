"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Ticket, ArrowRight, UserCheck } from "lucide-react";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await authApi.login({ email, password });
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
        setErrorMessage("E-mail ou senha incorretos.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword("123456");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-500 items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-2">
            <Ticket className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Acesse sua Conta</h1>
          <p className="text-sm text-zinc-400">
            Entre para comprar ingressos, gerenciar eventos ou validar entradas.
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Entrar
            </Button>
          </form>

          {/* Atalhos Rápidos para Avaliação */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Contas de Teste (Preenchimento Rápido):</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin("cliente1@verzel.com")}
                className="px-2 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors text-center"
              >
                👤 Cliente
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("organizador@verzel.com")}
                className="px-2 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors text-center"
              >
                🎪 Organizador
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin("portaria@verzel.com")}
                className="px-2 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors text-center"
              >
                🚪 Portaria
              </button>
            </div>
          </div>
        </div>

        {/* Link para Cadastro */}
        <p className="text-center text-xs text-zinc-400">
          Ainda não tem uma conta?{" "}
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300 font-medium underline-offset-4 hover:underline"
          >
            Cadastre-se gratuitamente
          </Link>
        </p>
      </div>
    </div>
  );
}
