import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInDays, addMonths, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Customer, PaymentStatus } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number, formatString = 'PPP'): string {
  return format(new Date(date), formatString, { locale: es });
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount);
}

export function calculateDerivedStatus(customer: Pick<Customer, 'billingDate' | 'currentPaymentStatus'>): PaymentStatus {
  const today = new Date();
  const billingDate = new Date(customer.billingDate);

  if (customer.currentPaymentStatus === 'Pagado') {
    // If marked as paid, it's 'Pagado' until the next cycle starts.
    // Or, if billingDate is in the future because payment advances it, it's 'Pagado'.
    return 'Pagado';
  }

  // If 'Pendiente'
  if (isPast(billingDate)) {
     const daysOverdue = differenceInDays(today, billingDate);
     // Allow a grace period of 1 day before marking as vencido to account for same-day billing.
     if (daysOverdue > 0) return 'Vencido';
  }
  
  const daysUntilBilling = differenceInDays(billingDate, today);
  if (daysUntilBilling <= 3 && daysUntilBilling >= 0) {
    return 'Próximo a vencer';
  }

  return 'Pendiente';
}

export function getNextBillingDate(currentBillingDate: Date): Date {
  return addMonths(new Date(currentBillingDate), 1);
}

export function getMonthYear(date: Date): string {
  return format(new Date(date), 'MMMM yyyy', { locale: es });
}
