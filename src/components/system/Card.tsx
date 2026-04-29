'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * AXIOM SYSTEM: CARD
 * Robust, token-sync container with variant support and framer-motion.
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
    glass:   "mercury-card bg-white/[0.04]",
  };

  return (
    <motion.div
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
