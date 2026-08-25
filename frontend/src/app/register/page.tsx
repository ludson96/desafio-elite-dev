"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ticket, User as UserIcon, Mail, Lock, UserPlus, AlertCircle } from "lucide-react";
import { authApi } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils/cn";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
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
        setErrorMessage("Erro ao criar conta. Verifique seus dados.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
        {/* Topo */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-sm mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Criar Nova Conta</h2>
          <p className="text-xs text-zinc-400">
            Cadastre-se na Elite Ingressos para comprar ou gerenciar eventos.
          </p>
        </div>

        {/* Feedback de Erro */}
        {errorMessage && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-zinc-950 border border-rose-900/60 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            placeholder="Ex: Carlos Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            leftIcon={<UserIcon className="w-4 h-4" />}
          />

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
            label="Senha (mínimo 6 caracteres)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          {/* Seleção do Perfil */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-300">Tipo de Perfil</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-semibold text-center transition-all",
                  role === "CLIENT"
                    ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                )}
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => setRole("ORGANIZER")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-semibold text-center transition-all",
                  role === "ORGANIZER"
                    ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                )}
              >
                Organizador
              </button>
              <button
                type="button"
                onClick={() => setRole("GATEKEEPER")}
                className={cn(
                  "p-2.5 rounded-xl border text-xs font-semibold text-center transition-all",
                  role === "GATEKEEPER"
                    ? "bg-zinc-800 border-zinc-600 text-white shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                )}
              >
                Portaria
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Cadastrar e Acessar
          </Button>
        </form>

        {/* Rodapé do Box */}
        <div className="text-center text-xs text-zinc-400">
          Já possui uma conta?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4">
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}
