
"use client";

import type { SavedInvoice } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface SavedInvoicesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: SavedInvoice[];
  onViewInvoice: (invoice: SavedInvoice) => void;
}

export function SavedInvoicesDialog({ isOpen, onClose, invoices, onViewInvoice }: SavedInvoicesDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] grid grid-rows-[auto_minmax(0,1fr)_auto]">
        <DialogHeader>
          <DialogTitle>Facturas Guardadas</DialogTitle>
          <DialogDescription>
            Aquí puedes ver todas las facturas que has guardado. Haz clic en una para ver detalles.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="min-h-0 pr-2">
          {invoices.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No hay facturas guardadas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>Factura: {invoice.id}</span>
                      <span className="text-sm font-normal text-muted-foreground">{invoice.invoiceDate}</span>
                    </CardTitle>
                    <CardDescription>Cliente: {invoice.customerName}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm flex-grow">
                    <p>Servicio: {invoice.serviceType} ({invoice.clientTimeType})</p>
                    <p>Periodo: {invoice.servicePeriodStart} - {invoice.servicePeriodEnd}</p>
                    <p className="font-semibold">Monto: {formatCurrency(invoice.amount)}</p>
                  </CardContent>
                  <CardFooter className="pt-3 border-t">
                     <Button variant="outline" size="sm" onClick={() => onViewInvoice(invoice)} className="w-full">
                       <Eye className="mr-2 h-4 w-4" /> Ver Detalles
                     </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    