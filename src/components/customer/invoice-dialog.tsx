
"use client";

import type { Customer, SavedInvoice } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatDate, formatCurrency, getNextBillingDate } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer, Save } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface InvoiceDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (invoice: SavedInvoice) => void;
}

export function InvoiceDialog({ customer, isOpen, onClose, onSaveInvoice }: InvoiceDialogProps) {
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const invoiceContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && customer) {
      const currentDate = new Date();
      setInvoiceDate(formatDate(currentDate));
      const generatedId = `INV-${customer.id.substring(0, 4).toUpperCase()}-${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')}`;
      setInvoiceId(generatedId);
    }
  }, [isOpen, customer]);

  if (!customer) return null;

  const servicePeriodStart = new Date(customer.billingDate);
  const servicePeriodEnd = new Date(getNextBillingDate(servicePeriodStart));
  servicePeriodEnd.setDate(servicePeriodEnd.getDate() - 1);

  const handlePrint = () => {
    const contentToPrint = invoiceContentRef.current;
    if (contentToPrint) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Factura</title>');
        printWindow.document.write(`
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); font-size: 16px; line-height: 24px; }
            .invoice-box table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
            .invoice-box table td { padding: 5px; vertical-align: top; }
            .invoice-box table tr td:nth-child(2) { text-align: right; }
            .invoice-box table tr.top table td { padding-bottom: 20px; }
            .invoice-box table tr.top table td.title { font-size: 45px; line-height: 45px; color: #333; }
            .invoice-box table tr.information table td { padding-bottom: 40px; }
            .invoice-box table tr.heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
            .invoice-box table tr.details td { padding-bottom: 20px; }
            .invoice-box table tr.item td { border-bottom: 1px solid #eee; }
            .invoice-box table tr.item.last td { border-bottom: none; }
            .invoice-box table tr.total td:nth-child(2) { border-top: 2px solid #eee; font-weight: bold; }
            .text-primary { color: hsl(var(--primary)); }
            .font-bold { font-weight: bold; }
            .text-muted-foreground { color: hsl(var(--muted-foreground)); }
            .mb-1 { margin-bottom: 0.25rem; } .mb-2 { margin-bottom: 0.5rem; } .mb-8 { margin-bottom: 2rem; }
            .text-xl { font-size: 1.25rem; } .text-2xl { font-size: 1.5rem; } .text-lg { font-size: 1.125rem; }
            .text-right { text-align: right; }
            .grid { display: grid; } .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .gap-4 { gap: 1rem; }
            .justify-between { justify-content: space-between; } .items-start { align-items: flex-start; } .flex { display: flex; }
            .w-full { width: 100%; } .max-w-xs { max-width: 20rem; } .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; } .mt-2 { margin-top: 0.5rem; }
            .border-t-2 { border-top-width: 2px; } .border-primary { border-color: hsl(var(--primary)); }
            h2,h3,h4 { margin-top:0; margin-bottom: 0.5rem;}
          </style>
        `);
        printWindow.document.write('</head><body><div class="invoice-box">');
        printWindow.document.write(contentToPrint.innerHTML);
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        toast({
            title: "Error de Impresión",
            description: "No se pudo abrir la ventana de impresión. Por favor, deshabilite el bloqueador de pop-ups.",
            variant: "destructive",
        });
      }
    }
  };

  const handleSave = () => {
    if (!customer) return;
    const savedInvoiceData: SavedInvoice = {
      id: invoiceId,
      customerId: customer.id,
      customerName: customer.fullName,
      invoiceDate: invoiceDate, 
      serviceType: customer.serviceType,
      clientTimeType: customer.clientTimeType,
      servicePeriodStart: formatDate(servicePeriodStart),
      servicePeriodEnd: formatDate(servicePeriodEnd),
      amount: customer.monthlyPrice,
      originalBillingDate: servicePeriodStart.toISOString(), 
    };
    onSaveInvoice(savedInvoiceData);
    toast({
      title: "Factura Guardada",
      description: `La factura ${invoiceId} ha sido guardada.`,
    });
    onClose(); // Close dialog after saving
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] grid grid-rows-[auto_minmax(0,1fr)_auto] gap-4">
        <DialogHeader>
          <DialogTitle>Factura para {customer.fullName}</DialogTitle>
          <DialogDescription>
            Detalles de la factura para el periodo actual. Fecha de Emisión: {invoiceDate}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 pr-1">
          <div ref={invoiceContentRef} className="p-4 sm:p-6 bg-card text-card-foreground rounded-lg">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-bold text-primary">WIFI CALENDER</h2>
                <p className="text-sm text-muted-foreground">Tu Proveedor de Servicios WiFi</p>
                <p className="text-xs text-muted-foreground">contact@wificalender.com</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-semibold">FACTURA</h3>
                <p className="text-sm text-muted-foreground">Nº: {invoiceId}</p>
                <p className="text-sm text-muted-foreground">Fecha: {invoiceDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <h4 className="font-semibold mb-1 text-sm">FACTURAR A:</h4>
                <p className="text-sm">{customer.fullName}</p>
                <p className="text-sm">{customer.phoneNumber}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm mb-8">
                <thead className="border-b-2 border-muted">
                  <tr>
                    <th className="p-2 text-left font-semibold">Descripción</th>
                    <th className="p-2 text-center font-semibold">Modalidad</th>
                    <th className="p-2 text-center font-semibold">Periodo Servicio</th>
                    <th className="p-2 text-right font-semibold">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-muted">
                    <td className="p-2">Servicio de Internet ({customer.serviceType})</td>
                    <td className="p-2 text-center">{customer.clientTimeType}</td>
                    <td className="p-2 text-center">
                      {formatDate(servicePeriodStart)} - {formatDate(servicePeriodEnd)}
                    </td>
                    <td className="p-2 text-right">{formatCurrency(customer.monthlyPrice)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-8">
              <div className="w-full max-w-xs">
                <div className="flex justify-between py-1 text-sm">
                  <span className="font-semibold">Subtotal:</span>
                  <span>{formatCurrency(customer.monthlyPrice)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-primary mt-2">
                  <span className="text-lg font-bold">TOTAL:</span>
                  <span className="text-lg font-bold">{formatCurrency(customer.monthlyPrice)}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground mt-8 border-t pt-4">
              <p className="mb-1">Gracias por elegir WIFI CALENDER.</p>
              <p>Si tiene alguna pregunta sobre esta factura, por favor contáctenos.</p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t sm:justify-start gap-2">
           <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Factura
          </Button>
          <DialogClose asChild className="sm:ml-auto">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    