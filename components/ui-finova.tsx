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
    default: "mercury-card",
    muted:   "mercury-card border-border bg-muted",
    outline: "mercury-card bg-transparent",
    glass:   "mercury-card bg-white/[0.04] backdrop-blur-md",
  };

  return (
    <motion.div
      whileTap={{ scale: 0.995 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        variants[variant as keyof typeof variants],
        className
      )}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}

/**
 * MERCURY: BUTTON (WORKSTATION STANDARD)
 * High contrast, no glows, 16px/Pill radius.
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
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 border-none shadow-none rounded-full",
    secondary: "bg-secondary border border-border text-foreground hover:bg-secondary/80 shadow-none rounded-full",
    ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/30 rounded-full",
    danger: "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 shadow-none rounded-full",
  };

  const sizes = {
    sm:  "px-3 py-1 text-[12px] font-medium h-7",
    md:  "px-4 py-2 text-[13px] font-medium h-8",
    lg:  "px-6 py-3 text-[14px] font-medium h-10"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "inline-flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none leading-none tracking-tight",
        variants[variant as keyof typeof variants],
        sizes[size as keyof typeof sizes],
        className
      )}
      disabled={isLoading || props.disabled}
      {...(props as any)}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mr-2" />
      )}
      {children}
    </motion.button>
  )
}

/**
 * MERCURY: LABEL
 */
export function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <label className={cn("text-[12px] font-medium text-muted-foreground block mb-2", className)}>
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
    default: "border-border text-muted-foreground bg-secondary",
    success: "border-mercury-green/20 text-mercury-green bg-mercury-green/10",
    warning: "border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    danger:  "border-destructive/20 text-destructive bg-destructive/10",
    brand:   "border-primary/20 text-primary bg-primary/10",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0 rounded-full border text-[9px] font-medium leading-none tracking-tight",
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

/**
 * MERCURY: UNIVERSAL DATA GRID (WORKSTATION 3.2 STANDARD)
 * These components enforce strict 1:1 parity and should be used for all tables.
 */
export function MercuryTable({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-[8px] border border-white/[0.08] bg-transparent", className)}>
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  )
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="h-[40px] border-b border-white/[0.08] bg-transparent">
      {children}
    </thead>
  )
}

export function TBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-white/[0.04]">
      {children}
    </tbody>
  )
}

export function TR({ children, className, isHeader = false }: { children: React.ReactNode, className?: string, isHeader?: boolean }) {
  return (
    <tr className={cn(
      "group transition-colors duration-150",
      isHeader ? "h-[40px]" : "h-[50.5px] hover:bg-white/[0.04]",
      className
    )}>
      {children}
    </tr>
  )
}

export function TD({ 
  children, 
  className, 
  isHeader = false,
  variant = 'default' 
}: { 
  children: React.ReactNode, 
  className?: string, 
  isHeader?: boolean,
  variant?: 'default' | 'positive' | 'negative' | 'date' | 'large'
}) {
  if (isHeader) {
    return (
      <th className={cn(
        "px-[10px] text-left text-[12px] font-[400] text-muted-foreground tracking-normal leading-none",
        className
      )}>
        {children}
      </th>
    )
  }

  const variants = {
    default:  "text-foreground/90 font-[380]",
    positive: "text-mercury-green font-[380]",
    negative: "text-foreground font-[380]",
    date:     "text-muted-foreground/60 font-[380]",
    large:    "text-[16px] font-[380] text-foreground/90"
  }

  return (
    <td className={cn(
      "px-[10px] text-[16px] leading-[1.2] whitespace-nowrap",
      variants[variant as keyof typeof variants],
      className
    )}>
      {children}
    </td>
  )
}

/**
 * MERCURY: INPUT
 */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full h-8 bg-white/[0.02] border border-white/[0.08] text-foreground/90 px-3 rounded-[6px] text-[13px] font-[380] placeholder-muted-foreground/20 focus:outline-none focus:border-white/10 transition-all duration-150",
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
        "w-full h-8 bg-white/[0.02] border border-white/[0.08] text-foreground/90 px-3 rounded-[6px] text-[13px] font-[380] focus:outline-none focus:border-white/10 transition-all duration-150 appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
