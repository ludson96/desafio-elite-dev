"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ticket,
  Calendar,
  PlusCircle,
  QrCode,
  ShoppingBag,
  LogOut,
  Menu,
  X,
  User as UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRole } from "@/utils/formatters";
import { cn } from "@/utils/cn";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isHydrated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                Elite Ingressos
              </span>
              <span className="text-[10px] text-zinc-500 font-mono -mt-1 tracking-wider uppercase">
                Verzel Challenge
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">

            {/* Links do Cliente */}
            {isHydrated && user?.role === "CLIENT" && (
              <>
                <Link
                  href="/my-tickets"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive("/my-tickets")
                      ? "text-white bg-zinc-800/60"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30"
                  )}
                >
                  <Ticket className="w-4 h-4 text-blue-400" />
                  Meus Ingressos
                </Link>
                <Link
                  href="/my-reservations"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive("/my-reservations")
                      ? "text-white bg-zinc-800/60"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30"
                  )}
                >
                  <ShoppingBag className="w-4 h-4 text-zinc-400" />
                  Minhas Compras
                </Link>
              </>
            )}

            {/* Links do Organizador */}
            {isHydrated && user?.role === "ORGANIZER" && (
              <>
                <Link
                  href="/organizer/events"
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive("/organizer/events")
                      ? "text-white bg-zinc-800/60"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30"
                  )}
                >
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Painel de Eventos
                </Link>
              </>
            )}

            {/* Links da Portaria */}
            {isHydrated && user?.role === "GATEKEEPER" && (
              <Link
                href="/gatekeeper/validate"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  isActive("/gatekeeper/validate")
                    ? "text-white bg-zinc-800/60"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30"
                )}
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                Validar Entrada
              </Link>
            )}
          </nav>
        </div>

        {/* Lado Direito: Ações & Perfil */}
        <div className="hidden md:flex items-center gap-3">
          {/* Botão de Destaque para Organizador */}
          {isHydrated && user?.role === "ORGANIZER" && (
            <Link href="/organizer/events/new">
              <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Novo Evento
              </Button>
            </Link>
          )}

          {isHydrated && user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-zinc-100 leading-tight">
                  {user.name}
                </span>
                <div className="flex justify-end mt-0.5">
                  <Badge variant={user.role === "ORGANIZER" ? "purple" : user.role === "GATEKEEPER" ? "warning" : "default"}>
                    {formatRole(user.role)}
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={logout}
                className="text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 p-2"
                title="Sair da Conta"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button size="sm" variant="ghost">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" variant="primary">
                  Criar Conta
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Botão Mobile Menu */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Menu Dropdown Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-900"
            >
              Eventos
            </Link>
            {isHydrated && user?.role === "CLIENT" && (
              <>
                <Link
                  href="/my-tickets"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-900 flex items-center gap-2"
                >
                  <Ticket className="w-4 h-4 text-blue-400" />
                  Meus Ingressos
                </Link>
                <Link
                  href="/my-reservations"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-900 flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-zinc-400" />
                  Minhas Compras
                </Link>
              </>
            )}
            {isHydrated && user?.role === "ORGANIZER" && (
              <>
                <Link
                  href="/organizer/events"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-900 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  Painel de Eventos
                </Link>
                <Link
                  href="/organizer/events/new"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm text-blue-400 hover:bg-zinc-900 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Criar Novo Evento
                </Link>
              </>
            )}
            {isHydrated && user?.role === "GATEKEEPER" && (
              <Link
                href="/gatekeeper/validate"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-900 flex items-center gap-2"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                Validar Entrada
              </Link>
            )}
          </nav>

          <div className="pt-3 border-t border-zinc-800">
            {isHydrated && user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-white">{user.name}</span>
                  </div>
                  <Badge>{formatRole(user.role)}</Badge>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  className="w-full"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  Sair da Conta
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
