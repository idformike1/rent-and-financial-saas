'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
export { cn }


/**
 * MERCURY: BUTTON (WORKSTATION STANDARD)
 * High contrast, adaptive token radius.
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
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 border-none  rounded-[var(--radius-sm)]",
    secondary: "bg-secondary border border-border text-foreground hover:bg-secondary/80  rounded-[var(--radius-sm)]",
    ghost: "bg-transparent text-clinical-muted hover:text-foreground hover:bg-secondary/30 rounded-[var(--radius-sm)]",
    danger: "bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20  rounded-[var(--radius-sm)]",
  };

  const sizes = {
    sm:  "px-3 py-1 text-mercury-body h-7",
    md:  "px-4 py-2 text-mercury-body h-8",
    lg:  "px-6 py-3 text-mercury-heading h-10"
  };

  return (
    <motion.button
      className={cn(
        "inline-flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none leading-none tracking-clinical",
        variants[variant as keyof typeof variants],
        sizes[size as keyof typeof sizes],
        className
      )}
      disabled={isLoading || props.disabled}
      {...(props as any)}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-[var(--radius-sm)] animate-spin mr-2" />
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
    <label className={cn("text-mercury-body text-clinical-muted block mb-2", className)}>
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
    default: "border-border text-clinical-muted bg-secondary",
    success: "border-mercury-green/20 text-mercury-green bg-mercury-green/10",
    warning: "border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/10",
    danger:  "border-destructive/20 text-destructive bg-destructive/10",
    brand:   "border-primary/20 text-primary bg-primary/10",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0 rounded-[var(--radius-sm)] border text-mercury-label-caps",
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
        "w-full h-8 bg-white/[0.02] border border-white/[0.08] text-foreground px-3 rounded-[var(--radius-sm)] text-mercury-body placeholder:text-clinical-muted focus:outline-none focus:border-white/10 transition-all duration-150",
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
        "w-full h-8 bg-white/[0.02] border border-white/[0.08] text-foreground px-3 rounded-[var(--radius-sm)] text-mercury-body focus:outline-none focus:border-white/10 transition-all duration-150 appearance-none cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
