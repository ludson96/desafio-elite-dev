import { Ticket } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Logo & Marca */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-zinc-100">Elite Ingressos</span>
            <p className="text-xs text-zinc-500">Plataforma de Eventos e Ingressos Digitais</p>
          </div>
        </div>

        {/* Informações do Desafio */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span>
            Desenvolvido para o Desafio Técnico <strong>Verzel (Elite Dev)</strong>
          </span>
        </div>

        {/* Direitos */}
        <div className="text-xs text-zinc-500 flex items-center gap-1">
          <span>© {new Date().getFullYear()} Elite Ingressos.</span>
        </div>
      </div>
    </footer>
  );
}
