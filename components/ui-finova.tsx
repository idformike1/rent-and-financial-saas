'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
export { cn }

/**
 * MERCURY: CARD (WORKSTATION STANDARD)
 * Flat, bordered, 6px radius. No shadows.
 */
interface CardProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'outline' | 'glass';
}

export function Card({
  children,
  className,
  variant = 'default',
  ...props
}: CardProps) {
  const variants = {
    default: "bg-[#0B0D10] border border-[#23252A] shadow-none",
    muted:   "bg-[#14161A] border border-[#23252A] shadow-none",
    outline: "bg-transparent border border-[#23252A] shadow-none",
    glass:   "bg-[#14161A]/50 backdrop-blur-xl border border-[#23252A] shadow-none",
  };

  return (
    <motion.div
      className={cn(
        "rounded-[6px] p-5 transition-none",
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * MERCURY: BUTTON (WORKSTATION STANDARD)
 * High contrast, no glows, 6px radius.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-[#E8E9EB] text-[#0B0D10] hover:bg-white border-none shadow-none",
    secondary: "bg-transparent border border-[#23252A] text-white hover:bg-[#14161A] shadow-none",
    ghost: "bg-transparent text-[#8A919E] hover:text-white hover:bg-[#14161A]",
    danger: "bg-transparent border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 shadow-none",
  };

  const sizes = {
    sm:  "px-3 py-1.5 text-xs font-medium",
    md:  "px-4 py-2 text-sm font-medium",
    lg:  "px-6 py-3 text-base font-medium"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-[6px] transition-none disabled:opacity-40 disabled:pointer-events-none leading-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  )
}

/**
 * MERCURY: LABEL
 */
export function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <label className={cn("text-[11px] font-medium text-[#8A919E] block mb-2 uppercase tracking-wider", className)}>
      {children}
    </label>
  )
}

/**
 * MERCURY: BADGE
 * Minimalist status indicators.
 */
export function Badge({
  children,
  className,
  variant = 'default'
}: {
  children: React.ReactNode,
  className?: string,
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand'
}) {
  const variants = {
    default: "border-[#23252A] text-[#8A919E] bg-[#1A1D24]",
    success: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    warning: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    danger:  "border-rose-500/30 text-rose-400 bg-rose-500/10",
    brand:   "border-[#E8E9EB]/30 text-[#E8E9EB] bg-[#E8E9EB]/10",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-[4px] border text-[11px] font-medium leading-none",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

/**
 * MERCURY: INPUT
 */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-[#0B0D10] border border-[#23252A] text-white px-3 py-2 rounded-[6px] text-sm placeholder-[#8A919E] focus:outline-none focus:border-white focus:ring-0 transition-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * MERCURY: SELECT (Basic override)
 */
export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full bg-[#0B0D10] border border-[#23252A] text-white px-3 py-2 rounded-[6px] text-sm focus:outline-none focus:border-white focus:ring-0 transition-none appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
