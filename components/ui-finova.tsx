'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * UTILITY: TW MERGE WRAPPER
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * AXIOM 2026: CARD (QUIET CONFIDENCE STANDARD)
 * Implements Glassmorphism, backdrop-blur-xl, and subtle 1px border.
 */
interface CardProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  children: React.ReactNode;
  variant?: 'elevated' | 'glass' | 'outline' | 'flat';
  isHoverable?: boolean;
}

export function Card({ 
  children, 
  className, 
  variant = 'elevated', 
  isHoverable = false,
  ...props 
}: CardProps) {
  const variants = {
    elevated: "bg-white dark:bg-slate-900 shadow-premium border border-slate-100 dark:border-slate-800",
    glass: "bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-premium",
    outline: "bg-transparent border border-slate-200 dark:border-slate-800",
    flat: "bg-slate-50 dark:bg-slate-950 border-none",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={isHoverable ? { y: -5, transition: { duration: 0.3 } } : undefined}
      className={cn(
        "rounded-3xl p-8 transition-shadow duration-500",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * AXIOM 2026: BUTTON (CALM MOTION)
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
    primary: "bg-brand text-white hover:bg-brand/90 shadow-md shadow-brand/20 dark:shadow-none",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20",
  };

  const sizes = {
    sm: "px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider",
    md: "px-8 py-3.5 text-xs font-black tracking-tight",
    lg: "px-10 py-5 text-sm font-black"
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-2xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest leading-none",
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
 * AXIOM 2026: BADGE (DATA DENSITY IMAGE 6)
 */
export function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand' }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    success: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold",
    warning: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-bold",
    danger: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-bold",
    brand: "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-foreground font-bold",
  };

  return (
    <span className={cn("px-4 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest inline-flex items-center gap-1.5", variants[variant], className)}>
      {children}
    </span>
  )
}

/**
 * AXIOM 2026: INPUT (LIQUID INTERACTION)
 */
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={cn(
        "w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/40 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-brand/30 outline-none transition-all duration-500 text-slate-900 dark:text-white placeholder:text-slate-400/80 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900",
        className
      )}
      {...props}
    />
  )
}

/**
 * AXIOM 2026: ROLLING COUNTER (ANALYTICAL DOMINANCE)
 */
export function RollingCounter({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let start = displayValue;
    let end = value;
    let duration = 1500;
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      let progress = Math.min((time - startTime) / duration, 1);
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      const current = start + (end - start) * easeOutExpo;
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="font-black italic tracking-tighter">
      {prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{suffix}
    </span>
  );
}
