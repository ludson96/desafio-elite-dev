"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop com Glassmorphism */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Caixa do Modal */}
      <div
        className={cn(
          "relative w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 transition-all animate-in zoom-in-95 fade-in duration-200",
          maxWidthStyles[maxWidth]
        )}
      >
        {/* Cabeçalho */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 sm:p-6 border-b border-zinc-800/80">
            <div className="space-y-1 pr-6">
              {title && (
                <h3 className="text-lg font-semibold text-zinc-100 leading-none">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Conteúdo */}
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
