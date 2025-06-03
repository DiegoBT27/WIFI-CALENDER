
"use client";

import type { Customer, PaymentRecord } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentRecordSchema, type PaymentRecordFormValues } from '@/lib/schemas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate, formatCurrency, getNextBillingDate, getMonthYear, cn } from '@/lib/utils';
import { PlusCircle, Trash2, Calendar as CalendarIconLucide } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';

interface PaymentHistoryDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateCustomer: (updatedCustomer: Customer) => void;
}

export function PaymentHistoryDialog({ customer, isOpen, onClose, onUpdateCustomer }: PaymentHistoryDialogProps) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isPaymentDatePickerOpen, setIsPaymentDatePickerOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PaymentRecordFormValues>({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: {
      date: new Date(),
      amount: 0, 
      monthPaid: customer ? getMonthYear(new Date(customer.billingDate)) : getMonthYear(new Date()),
    },
  });
  
  useEffect(() => {
    if (customer && isOpen) {
      form.reset({
        date: new Date(),
        amount: 0,
        monthPaid: getMonthYear(new Date(customer.billingDate)),
      });
      setShowPaymentForm(false); 
    }
  }, [customer, form, isOpen]);


  if (!customer) return null;

  const handleAddPayment = (data: PaymentRecordFormValues) => {
    const newPayment: PaymentRecord = {
      id: crypto.randomUUID(),
      ...data,
    };

    const updatedCustomer: Customer = {
      ...customer,
      paymentHistory: [...customer.paymentHistory, newPayment],
      currentPaymentStatus: 'Pagado',
      billingDate: getNextBillingDate(new Date(customer.billingDate)), 
    };
    onUpdateCustomer(updatedCustomer);
    toast({ title: "Pago registrado", description: `Se registró el pago para ${customer.fullName}.` });
    setShowPaymentForm(false);
    form.reset({ date: new Date(), amount: 0, monthPaid: getMonthYear(new Date(updatedCustomer.billingDate)) });
  };

  const handleDeletePayment = (paymentId: string) => {
    const updatedPaymentHistory = customer.paymentHistory.filter(p => p.id !== paymentId);
    const updatedCustomer = { ...customer, paymentHistory: updatedPaymentHistory };
    onUpdateCustomer(updatedCustomer);
    toast({ title: "Pago eliminado", description: "El registro de pago ha sido eliminado." });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] grid grid-rows-[auto_minmax(0,1fr)_auto] gap-4">
        <DialogHeader>
          <DialogTitle>Historial de Pagos: {customer.fullName}</DialogTitle>
          <DialogDescription>
            Ver y registrar pagos para este cliente. Próximo corte: {formatDate(customer.billingDate)}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 pr-1">
          {customer.paymentHistory.length === 0 && !showPaymentForm && (
            <p className="text-sm text-muted-foreground text-center py-4">No hay pagos registrados.</p>
          )}
          {customer.paymentHistory.map((payment) => (
            <div key={payment.id} className="mb-3 p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{formatCurrency(payment.amount)} - {payment.monthPaid}</p>
                  <p className="text-xs text-muted-foreground">Pagado el: {formatDate(payment.date)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(payment.id)} aria-label="Eliminar pago">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        
          {showPaymentForm && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddPayment)} className="mt-6 p-4 border rounded-md space-y-4">
                <h3 className="text-lg font-medium">Registrar Nuevo Pago</h3>
                 <FormField
                  control={form.control}
                  name="monthPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mes Pagado</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Enero 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          {...field} 
                          onChange={e => {
                            const value = e.target.value;
                            field.onChange(value === '' ? '' : parseFloat(value));
                          }}
                          value={field.value === 0 && form.formState.isSubmitted === false && !form.formState.isDirty ? '' : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Pago</FormLabel>
                      <Popover open={isPaymentDatePickerOpen} onOpenChange={setIsPaymentDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIconLucide className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                                field.onChange(date);
                                setIsPaymentDatePickerOpen(false);
                            }}
                            disabled={(date) =>
                               date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowPaymentForm(false);
                    form.reset({ date: new Date(), amount: 0, monthPaid: getMonthYear(new Date(customer.billingDate)) });
                  }}>Cancelar</Button>
                  <Button type="submit">Guardar Pago</Button>
                </div>
              </form>
            </Form>
          )}
        </ScrollArea>
        
        <DialogFooter className="pt-4 border-t">
          {!showPaymentForm && (
            <Button 
              onClick={() => {
                form.reset({ date: new Date(), amount: 0, monthPaid: getMonthYear(new Date(customer.billingDate)) });
                setShowPaymentForm(true);
              }} 
              className="w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Registrar Pago
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

