import React from "react";
import { cn } from "@/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "purple" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const dotStyles: Record<string, string> = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    purple: "bg-zinc-400",
    default: "",
    outline: "",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  const dot = dotStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-xs",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && <span data-testid="badge-dot" className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />}
      {children}
    </span>
  );
}
