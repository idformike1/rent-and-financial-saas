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
    default: "bg-card border border-border shadow-none",
    muted:   "bg-muted border border-border shadow-none",
    outline: "bg-transparent border border-border shadow-none",
    glass:   "bg-card/80 border border-border shadow-none",
  };

  return (
    <motion.div
      className={cn(
        "rounded-[8px] p-5 transition-none",
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
 * High contrast, no glows, 8px/Pill radius.
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
    primary: "bg-primary text-primary-foreground hover:bg-primary/95 border-none shadow-none rounded-full",
    secondary: "bg-card border border-border text-foreground hover:bg-muted shadow-none rounded-[8px]",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted rounded-[8px]",
    danger: "bg-card border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 shadow-none rounded-[8px]",
  };

  const sizes = {
    sm:  "px-3 py-1.5 text-xs font-bold h-8",
    md:  "px-4 py-2 text-[13px] font-bold h-10",
    lg:  "px-6 py-3 text-[14px] font-bold h-12"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-none disabled:opacity-40 disabled:pointer-events-none leading-none uppercase tracking-widest",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
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
    <label className={cn("text-[12px] font-bold text-muted-foreground block mb-2 uppercase tracking-widest", className)}>
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
    default: "border-border text-muted-foreground bg-muted",
    success: "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    warning: "border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    danger:  "border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-500/10",
    brand:   "border-primary/20 text-primary bg-primary/10",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-[4px] border text-[11px] font-bold leading-none uppercase tracking-tight",
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
        "w-full bg-card border border-border text-foreground px-3 py-2 rounded-[8px] text-sm font-medium placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-none",
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
        "w-full bg-card border border-border text-foreground px-3 py-2 rounded-[8px] text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-none appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
