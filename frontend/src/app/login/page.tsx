"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Ticket, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const { setAuth } = useAuthStore();
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
        router.push(redirect);
      }
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro ao realizar login. Verifique suas credenciais.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickAccount = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword("123456");
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
        {/* Topo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-sm mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Acesse sua conta</h2>
          <p className="text-xs text-zinc-400">
            Entre com suas credenciais para gerenciar seus ingressos ou eventos.
          </p>
        </div>

        {/* Feedback de Erro Sólido e Elegante */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-zinc-950 border border-rose-900/60 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu.email@exemplo.com"
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
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Entrar na Plataforma
          </Button>
        </form>

        {/* Contas de Demonstração Rápidas */}
        <div className="space-y-2 pt-4 border-t border-zinc-800">
          <span className="text-[11px] text-zinc-400 block text-center font-medium">
            Acesso Rápido para Avaliação (Senha: 123456):
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillQuickAccount("cliente1@verzel.com")}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 font-medium transition-colors"
            >
              👤 Cliente
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount("organizador@verzel.com")}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 font-medium transition-colors"
            >
              👑 Organizador
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount("portaria@verzel.com")}
              className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 font-medium transition-colors"
            >
              🚪 Portaria
            </button>
          </div>
        </div>

        {/* Rodapé do Box */}
        <div className="text-center text-xs text-zinc-400">
          Não possui uma conta?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4">
            Cadastre-se gratuitamente
          </Link>
        </div>
      </div>
    </div>
  );
}
