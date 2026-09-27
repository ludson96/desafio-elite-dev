import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ServerNoticeBannerProps {
  onDismiss?: () => void;
}

export function ServerNoticeBanner({ onDismiss }: ServerNoticeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside
      role="status"
      aria-label="Aviso sobre inicialização da API"
      className="relative z-50 w-full border-b border-amber-200/70 bg-gradient-to-r from-amber-50 via-amber-50/80 to-amber-100/60 px-4 py-2.5 text-xs text-amber-900 transition-colors sm:px-6 sm:text-sm shadow-xs"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Subtle pulsating icon / status dot */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>

          <AlertCircle className="h-4 w-4 shrink-0 text-amber-700/80" aria-hidden="true" />

          <p className="font-normal text-amber-900/90 leading-tight">
            <span className="font-medium text-amber-950">Aviso: </span>
            Como a API está hospedada no plano gratuito do Render, o servidor hiberna após 15 min de inatividade e pode levar até ~45 segundos para inicializar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            onDismiss?.();
          }}
          className="shrink-0 rounded-md p-1 text-amber-700/70 hover:bg-amber-200/50 hover:text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-colors"
          aria-label="Fechar aviso"
          title="Fechar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}