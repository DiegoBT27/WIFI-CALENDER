
import { z } from 'zod';

export const paymentRecordSchema = z.object({
  id: z.string().optional(), // Optional for new records
  date: z.date({ required_error: "La fecha de pago es requerida." }),
  amount: z.coerce.number().positive({ message: "El monto debe ser positivo." }),
  monthPaid: z.string().min(1, "El mes pagado es requerido."),
});


export const customerFormSchema = z.object({
  fullName: z.string().min(3, { message: "El nombre completo debe tener al menos 3 caracteres." }),
  serviceType: z.enum(['ROUTER', 'EAP'], { required_error: "El tipo de servicio es requerido." }),
  clientTimeType: z.enum(['Hora', 'Semanal', 'Mensual'], { required_error: "El tiempo de cliente es requerido." }),
  phoneNumber: z.string().min(7, { message: "El número de teléfono debe ser válido." }).regex(/^\+?[0-9\s-]{7,}$/, { message: "Formato de teléfono inválido." }),
  serviceStartDate: z.date({ required_error: "La fecha de inicio del servicio es requerida." }),
  billingDate: z.date({ required_error: "La fecha de corte/facturación es requerida." }),
  monthlyPrice: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.coerce.number({
      required_error: "El precio es requerido.",
      invalid_type_error: "El precio debe ser un número válido.",
    })
  ),
  currentPaymentStatus: z.enum(['Pagado', 'Pendiente', 'Vencido'], { required_error: "El estado del pago es requerido." }),
  planSpeed: z.string().optional(),
  observations: z.string().optional(),
  profileName: z.string().optional().nullable().transform(val => val?.trim() === '' ? null : val), // Nuevo campo, se normaliza a null si es string vacío
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
export type PaymentRecordFormValues = z.infer<typeof paymentRecordSchema>;
