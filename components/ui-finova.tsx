'use client'

import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * UTILITY: TW MERGE WRAPPER
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * FINOVA COMPONENT: CARD (DESIGN STANDARD IMAGE 7)
 * Implements soft shadows, rounded-2xl geometry, and premium gap density.
 */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'flat' | 'elevated' | 'glass';
}

export function Card({ children, className, variant = 'elevated', ...props }: CardProps) {
  const variants = {
    flat: "bg-[var(--card)] border border-[var(--border)]",
    elevated: "bg-[var(--card)] border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow",
    glass: "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/20"
  };

  return (
    <div 
      className={cn(
        "rounded-2xl p-6",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * FINOVA COMPONENT: BUTTON (DESIGN STANDARD IMAGE 5)
 * Focuses on high contrast primary and subtle ghost triggers.
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
    primary: "bg-brand text-white hover:bg-brand/90 shadow-sm",
    secondary: "bg-surface-100 text-surface-900 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-100",
    ghost: "bg-transparent text-slate-500 hover:bg-surface-50 dark:hover:bg-surface-800",
    danger: "bg-danger text-white hover:bg-danger/90 shadow-sm"
  };

  const sizes = {
    sm: "px-4 py-2 text-[11px] font-bold uppercase tracking-wider",
    md: "px-6 py-3 text-xs font-bold tracking-tight",
    lg: "px-8 py-4 text-sm font-black"
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
      )}
      {children}
    </button>
  )
}

/**
 * FINOVA COMPONENT: BADGE (DATA DENSITY IMAGE 6)
 */
export function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-black/5", variants[variant], className)}>
      {children}
    </span>
  )
}

/**
 * FINOVA COMPONENT: INPUT (INTERACTION IMAGE 7)
 */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn(
        "w-full bg-[var(--input)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500",
        className
      )}
      {...props}
    />
  )
}
