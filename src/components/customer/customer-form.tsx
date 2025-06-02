
"use client";

import type { Customer, ServiceType, ClientTimeType } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerFormSchema, type CustomerFormValues } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn, formatDate } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from 'react';

interface CustomerFormProps {
  customer?: Customer; // For editing
  onSubmit: (data: CustomerFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CustomerForm({ customer, onSubmit, onCancel, isSubmitting }: CustomerFormProps) {
  const [isServiceStartDatePickerOpen, setIsServiceStartDatePickerOpen] = useState(false);
  const [isBillingDatePickerOpen, setIsBillingDatePickerOpen] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer
      ? {
          ...customer,
          serviceStartDate: customer.serviceStartDate ? new Date(customer.serviceStartDate) : undefined,
          billingDate: customer.billingDate ? new Date(customer.billingDate) : undefined,
          planSpeed: customer.planSpeed || '',
        }
      : {
          fullName: '',
          serviceType: 'ROUTER' as ServiceType,
          clientTimeType: 'Mensual' as ClientTimeType,
          phoneNumber: '',
          monthlyPrice: '' as any,
          currentPaymentStatus: 'Pendiente',
          planSpeed: '',
          observations: '',
          serviceStartDate: new Date(),
          billingDate: new Date(),
        },
  });

  const clientTimeTypeValue = form.watch("clientTimeType");

  const getPriceLabel = (timeType: ClientTimeType | undefined) => {
    switch (timeType) {
      case 'Hora':
        return 'Precio por Hora';
      case 'Semanal':
        return 'Precio Semanal';
      case 'Mensual':
      default:
        return 'Precio Mensual';
    }
  };

  useEffect(() => {
    if (customer) {
      form.reset({
        ...customer,
        serviceStartDate: customer.serviceStartDate ? new Date(customer.serviceStartDate) : new Date(),
        billingDate: customer.billingDate ? new Date(customer.billingDate) : new Date(),
        planSpeed: customer.planSpeed || '',
      });
    } else {
       form.reset({
          fullName: '',
          serviceType: 'ROUTER' as ServiceType,
          clientTimeType: 'Mensual' as ClientTimeType,
          phoneNumber: '',
          monthlyPrice: '' as any,
          currentPaymentStatus: 'Pendiente',
          planSpeed: '',
          observations: '',
          serviceStartDate: new Date(),
          billingDate: new Date(),
       });
    }
  }, [customer, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input placeholder="Juan Pérez" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Servicio</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de servicio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ROUTER">ROUTER</SelectItem>
                  <SelectItem value="EAP">EAP</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientTimeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiempo de Cliente</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (!customer) {
                    form.setValue('monthlyPrice', '' as any, { shouldValidate: false });
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tiempo de cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Hora">Hora</SelectItem>
                  <SelectItem value="Semanal">Semanal</SelectItem>
                  <SelectItem value="Mensual">Mensual</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de teléfono</FormLabel>
              <FormControl>
                <Input placeholder="+54 9 11 12345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="serviceStartDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de inicio del servicio</FormLabel>
                <Popover open={isServiceStartDatePickerOpen} onOpenChange={setIsServiceStartDatePickerOpen}>
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
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setIsServiceStartDatePickerOpen(false);
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
          <FormField
            control={form.control}
            name="billingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de corte/facturación</FormLabel>
                <Popover open={isBillingDatePickerOpen} onOpenChange={setIsBillingDatePickerOpen}>
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
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setIsBillingDatePickerOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="monthlyPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{getPriceLabel(clientTimeTypeValue)}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    value={field.value === 0 && !customer ? '' : field.value} // Show empty if 0 for new customer
                    onChange={e => {
                        const value = e.target.value;
                        if (value === '') {
                            field.onChange(''); // Allow empty string to clear
                        } else {
                            const numValue = parseFloat(value);
                            field.onChange(isNaN(numValue) ? value : numValue); // Pass original string if NaN for Zod to catch
                        }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentPaymentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado del pago inicial</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Pagado">Pagado</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="planSpeed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Velocidad del Plan</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: 50 (se añadirá MB), Fast"
                  {...field}
                  onBlur={(e) => {
                    field.onBlur?.(e); // Call original onBlur from react-hook-form
                    const currentValue = e.target.value.trim();
                    // Check if the value is a number (integer or decimal)
                    if (currentValue && /^\d+(\.\d+)?$/.test(currentValue)) {
                      form.setValue('planSpeed', `${currentValue} MB`, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones</FormLabel>
              <FormControl>
                <Textarea placeholder="Notas adicionales sobre el cliente o servicio..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (customer ? "Guardando..." : "Agregando...") : (customer ? 'Guardar Cambios' : 'Agregar Cliente')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

