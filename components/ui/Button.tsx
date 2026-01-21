"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-purple-punch to-pink-pop text-white shadow-lg shadow-purple-punch/30 hover:shadow-xl hover:shadow-purple-punch/40",
  secondary:
    "bg-white text-purple-punch border-2 border-purple-punch hover:bg-purple-punch/5",
  danger:
    "bg-gradient-to-r from-coral-warm to-pink-pop text-white shadow-lg shadow-coral-warm/30 hover:shadow-xl hover:shadow-coral-warm/40",
  ghost:
    "bg-transparent text-purple-punch hover:bg-purple-punch/10",
};

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        font-bold rounded-xl
        transition-all duration-200 ease-out
        transform hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100
        btn-pulse
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
