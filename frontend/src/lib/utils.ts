import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatRUT(rut: string): string {
  // Format Chilean RUT: 12345678-9 -> 12.345.678-9
  const cleanRUT = rut.replace(/[^0-9kK-]/g, '')
  const parts = cleanRUT.split('-')
  if (parts.length !== 2) return rut

  const number = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${number}-${parts[1]}`
}
