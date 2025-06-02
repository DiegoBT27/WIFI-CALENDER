import type { Customer, ServiceType, ClientTimeType } from './types';
import { addMonths, subDays, subMonths } from 'date-fns';

const today = new Date();

export const initialCustomers: Customer[] = [
  {
    id: '1',
    fullName: 'Ana García López',
    serviceType: 'ROUTER',
    clientTimeType: 'Mensual',
    phoneNumber: '+54 9 11 23456789',
    serviceStartDate: subMonths(today, 5),
    billingDate: addMonths(today,0), // Due today
    monthlyPrice: 25.50,
    currentPaymentStatus: 'Pagado',
    planSpeed: '50 MB',
    observations: 'Cliente fundador. Conexión estable.',
    paymentHistory: [
      { id: 'p1', date: subMonths(today, 1), amount: 25.50, monthPaid: 'Mes Anterior' },
    ],
  },
  {
    id: '2',
    fullName: 'Carlos Rodríguez Martínez',
    serviceType: 'EAP',
    clientTimeType: 'Mensual',
    phoneNumber: '+52 1 55 98765432',
    serviceStartDate: subMonths(today, 2),
    billingDate: subDays(today, 5), // Vencido
    monthlyPrice: 30.00,
    currentPaymentStatus: 'Pendiente',
    planSpeed: '100 MB',
    observations: 'Solicitó cambio de plan el mes pasado.',
    paymentHistory: [],
  },
  {
    id: '3',
    fullName: 'Sofía Hernández Pérez',
    serviceType: 'ROUTER',
    clientTimeType: 'Semanal',
    phoneNumber: '+34 600 123 456',
    serviceStartDate: subMonths(today, 10),
    billingDate: addMonths(subDays(today,2),1) , // Pagado, próximo corte el mes que viene menos 2 dias
    monthlyPrice: 20.00,
    currentPaymentStatus: 'Pagado',
    planSpeed: 'Fast',
    paymentHistory: [
      { id: 'p2', date: subDays(today,2), amount: 20.00, monthPaid: 'Mes Actual' },
      { id: 'p3', date: subMonths(subDays(today,2),1), amount: 20.00, monthPaid: 'Mes Anterior' },
    ],
  },
  {
    id: '4',
    fullName: 'Luis González Sánchez',
    serviceType: 'ROUTER',
    clientTimeType: 'Mensual',
    phoneNumber: '+44 20 7224 3688',
    serviceStartDate: subMonths(today, 1),
    billingDate: subDays(today, 10), // Vencido
    monthlyPrice: 35.75,
    currentPaymentStatus: 'Pendiente',
    planSpeed: '75 MB',
    observations: 'Nuevo cliente, instalación reciente.',
    paymentHistory: [],
  },
  {
    id: '5',
    fullName: 'Isabel Fernández Romero',
    serviceType: 'EAP',
    clientTimeType: 'Hora',
    phoneNumber: '+1 202 555 0149',
    serviceStartDate: subMonths(today, 0), // Started this month
    billingDate: addMonths(today,1), // Pagado (assuming payment on start), due next month
    monthlyPrice: 28.00,
    currentPaymentStatus: 'Pagado',
    // planSpeed: undefined, // Example of a customer without planSpeed
    paymentHistory: [
       { id: 'p4', date: today, amount: 28.00, monthPaid: 'Mes Actual (Inicio)' }
    ],
  },
  {
    id: '6',
    fullName: 'Miguel Torres Jiménez',
    serviceType: 'ROUTER',
    clientTimeType: 'Mensual',
    phoneNumber: '+54 9 351 7654321',
    serviceStartDate: subMonths(today, 7),
    billingDate: subDays(today, -2), // Próximo a vencer (2 días)
    monthlyPrice: 22.99,
    currentPaymentStatus: 'Pendiente',
    planSpeed: 'Básico 20 MB',
    paymentHistory: [
      { id: 'p5', date: subMonths(today,1), amount: 22.99, monthPaid: 'Mes Anterior'},
    ],
  },
];

