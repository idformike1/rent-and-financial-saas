'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
export { cn }

/**
 * AXIOM 2026: CARD (QUIET CONFIDENCE STANDARD)
 * Implements Glassmorphism, backdrop-blur-xl, and subtle 1px border.
 */
/**
 * AXIOM 2026: CARD (V3 CINEMATIC GLASS)
 */
interface CardProps extends React.ComponentPropsWithoutRef<typeof motion.div> {
  children: React.ReactNode;
  variant?: 'glass' | 'outline' | 'flat';
  isHoverable?: boolean;
}

export function Card({ 
  children, 
  className, 
  variant = 'glass', 
  isHoverable = false,
  ...props 
}: CardProps) {
  const variants = {
    glass: "glass-panel shadow-2xl",
    outline: "bg-transparent border border-white/10",
    flat: "bg-white/5 border-none",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={isHoverable ? { y: -5, transition: { duration: 0.3 } } : undefined}
      className={cn(
        "rounded-[2.5rem] p-10 transition-all duration-500",
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
 * AXIOM 2026: BUTTON (V3 PILL)
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
    primary: "bg-brand text-white hover:bg-brand/90 shadow-lg shadow-brand/20 glow-orange border-none",
    secondary: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20",
  };

  const sizes = {
    sm: "px-6 py-2.5 text-meta",
    md: "px-10 py-4 text-xs font-black tracking-tight",
    lg: "px-12 py-5 text-sm font-black"
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all duration-300 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest leading-none",
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
 * AXIOM 2026: LABEL (SOFT TEXT)
 */
export function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <label className={cn("text-sm font-medium text-zinc-300 block mb-2", className)}>
      {children}
    </label>
  )
}

/**
 * AXIOM 2026: BADGE (DATA DENSITY)
 */
export function Badge({ children, className, variant = 'default' }: { children: React.ReactNode, className?: string, variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand' }) {
  const variants = {
    default: "bg-white/5 text-slate-400 border border-white/10",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold",
    brand: "bg-brand/10 text-brand border border-brand/20 font-bold",
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
        "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-brand/50 outline-none transition-all duration-500 text-white placeholder:text-slate-500 focus:bg-white/10",
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
