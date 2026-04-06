'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
export { cn }

/**
 * AXIOM 2026: CARD (SLATE & EMBER — V3 SOVEREIGN)
 * Glass surface, 3xl radius, subtle ember depth.
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
    outline: "bg-transparent border border-white/5",
    flat: "bg-white/30 border-none",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      whileHover={isHoverable ? { y: -4, transition: { duration: 0.3 } } : undefined}
      className={cn(
        "rounded-3xl p-8 transition-all duration-500",
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
 * AXIOM 2026: BUTTON (SLATE & EMBER — PILL SOVEREIGN)
 * Primary = Ember glow. Every button rounded-full.
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
    primary: "bg-[var(--primary)] text-foreground hover:bg-[var(--primary-dark,#E64A19)] shadow-[0_0_15px_rgba(255,87,51,0.2)] hover:shadow-[0_0_25px_rgba(255,87,51,0.35)] border-none glow-primary",
    secondary: "bg-white/3 text-foreground hover:bg-white/5 border border-border",
    ghost: "bg-transparent text-[var(--muted)] hover:text-foreground hover:bg-white/3",
    danger: "bg-[#F43F5E] text-foreground hover:bg-[#E11D48] shadow-[0_0_15px_rgba(244,63,94,0.2)]",
  };

  const sizes = {
    sm:  "px-5 py-2 text-[10px] font-black tracking-widest",
    md:  "px-8 py-3.5 text-[11px] font-black tracking-widest",
    lg:  "px-10 py-4 text-xs font-black tracking-widest"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all duration-300 active:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none uppercase leading-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2.5" />
      )}
      {children}
    </button>
  )
}

/**
 * AXIOM 2026: LABEL (SOFT METADATA)
 */
export function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <label className={cn("text-sm font-semibold text-[var(--muted)] block mb-2 uppercase tracking-wider text-[10px]", className)}>
      {children}
    </label>
  )
}

/**
 * AXIOM 2026: BADGE (DATA DENSITY — EMBER STANDARD)
 * All status badges align to Ember palette or neutral Slate.
 */
export function Badge({
  children,
  className,
  variant = 'default'
}: {
  children: React.ReactNode,
  className?: string,
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'primary'
}) {
  const variants = {
    default: "bg-white/3 text-[var(--muted)] border border-border",
    // Ember-tinted for primary/brand actions
    primary: "bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--primary)]/20 font-bold",
    brand:   "bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--primary)]/20 font-bold",
    // Status semantics — kept distinct for data clarity
    success: "bg-[var(--primary-muted)] text-[var(--primary)] border border-[var(--primary)]/20 font-bold",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold",
    danger:  "bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold",
  };

  return (
    <span className={cn("px-3 py-1 rounded-full text-[9px] uppercase font-black tracking-widest inline-flex items-center gap-1.5", variants[variant], className)}>
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
        "w-full bg-card/[0.03] border border-[var(--border)] rounded-xl px-5 py-3.5 text-sm focus:border-[var(--primary)]/50 focus:ring-2 focus:ring-[var(--primary)]/10 outline-none transition-all duration-300 text-foreground placeholder:text-[var(--muted)]",
        className
      )}
      {...props}
    />
  )
}

/**
 * AXIOM 2026: ROLLING COUNTER (FINANCIAL TELEMETRY)
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
    <span className="font-black tracking-tighter">
      {prefix}{displayValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}{suffix}
    </span>
  );
}
