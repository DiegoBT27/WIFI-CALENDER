
export type PaymentStatus = 'Pagado' | 'Pendiente' | 'Vencido' | 'Próximo a vencer';

export interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  monthPaid: string; // e.g., "Enero 2024"
}

export type ServiceType = 'ROUTER' | 'EAP';
export type ClientTimeType = 'Hora' | 'Semanal' | 'Mensual';

export interface Customer {
  id: string;
  fullName: string;
  serviceType: ServiceType;
  clientTimeType: ClientTimeType;
  phoneNumber: string;
  serviceStartDate: Date;
  billingDate: Date; // Actual next billing date
  monthlyPrice: number;
  currentPaymentStatus: 'Pagado' | 'Pendiente' | 'Vencido'; // Underlying status, now includes Vencido
  observations?: string;
  paymentHistory: PaymentRecord[];
  planSpeed?: string;
  profileName?: string | null; // Nuevo campo para el nombre del perfil
}

// Helper type for form data, allows string dates for input binding
export type CustomerFormData = Omit<Customer, 'id' | 'paymentHistory' | 'serviceStartDate' | 'billingDate' | 'currentPaymentStatus'> & {
  serviceStartDate?: Date;
  billingDate?: Date;
  currentPaymentStatus: 'Pagado' | 'Pendiente' | 'Vencido';
  planSpeed?: string;
  profileName?: string | null; // Nuevo campo para el nombre del perfil
};

export interface SavedInvoice {
  id: string; // The generated invoice ID like INV-XXXX-YYYYMMDD
  customerId: string;
  customerName: string;
  invoiceDate: string; // Emission date, as string from formatDate
  serviceType: ServiceType;
  clientTimeType: ClientTimeType;
  servicePeriodStart: string; // billingDate from customer, as string
  servicePeriodEnd: string; // calculated, as string
  amount: number;
  originalBillingDate: string; // Store as ISO string to be serializable
}
