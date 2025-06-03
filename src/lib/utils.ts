
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
  // Ensure billingDate is treated as a date at midnight for consistent comparisons
  const billingDate = new Date(customer.billingDate);
  billingDate.setHours(0, 0, 0, 0);
  
  const todayAtMidnight = new Date();
  todayAtMidnight.setHours(0,0,0,0);

  const daysUntilBilling = differenceInDays(billingDate, todayAtMidnight);

  // 1. Check for "Próximo a vencer" first - this has the highest priority now.
  // If billingDate is today or up to 3 days in the future.
  if (daysUntilBilling >= 0 && daysUntilBilling <= 3) {
    return 'Próximo a vencer';
  }

  // 2. If not "Próximo a vencer", then evaluate currentPaymentStatus.
  if (customer.currentPaymentStatus === 'Pagado') {
    return 'Pagado';
  }

  if (customer.currentPaymentStatus === 'Vencido') {
    // If manually set to Vencido, honor it.
    return 'Vencido';
  }
  
  // 3. If currentPaymentStatus is 'Pendiente' (and not "Próximo a vencer")
  if (customer.currentPaymentStatus === 'Pendiente') {
    // Check if billingDate is in the past making it 'Vencido'
    // isPast checks if the first date is before the second date.
    // We compare billingDate (e.g., Oct 20, 00:00) with today (e.g., Oct 21, 15:00).
    // If billingDate is yesterday or earlier, isPast(billingDate) will be true.
    if (isPast(billingDate) && ! (billingDate.getTime() === todayAtMidnight.getTime())) { // if it's not today
        return 'Vencido';
    }
    // If billingDate is today (daysUntilBilling would be 0) but wasn't caught by "Próximo a vencer",
    // or if it's in the future (but more than 3 days away), it's 'Pendiente'.
    return 'Pendiente';
  }
  
  // Fallback for any unexpected currentPaymentStatus, though schema should prevent this.
  return 'Pendiente';
}

export function getNextBillingDate(currentBillingDate: Date): Date {
  return addMonths(new Date(currentBillingDate), 1);
}

export function getMonthYear(date: Date): string {
  return format(new Date(date), 'MMMM yyyy', { locale: es });
}

