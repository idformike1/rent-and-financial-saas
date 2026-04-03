import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * UTILITY: TW MERGE WRAPPER
 * This utility is universal and can be used on both Server and Client.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
