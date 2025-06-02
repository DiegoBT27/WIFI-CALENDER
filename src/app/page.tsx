
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Customer, PaymentStatus, ServiceType, SavedInvoice } from '@/lib/types';
import { CustomerCard } from '@/components/customer/customer-card';
import { CustomerForm } from '@/components/customer/customer-form';
import { PaymentHistoryDialog } from '@/components/customer/payment-history-dialog';
import { InvoiceDialog } from '@/components/customer/invoice-dialog';
import { SavedInvoicesDialog } from '@/components/invoice/saved-invoices-dialog';
import { ViewSavedInvoiceDialog } from '@/components/invoice/view-saved-invoice-dialog';
import { CustomerFilters, type FilterValues } from '@/components/customer/customer-filters';
import { AppHeader } from '@/components/layout/app-header';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Users, WifiOff } from 'lucide-react';
import { initialCustomers } from '@/lib/initial-customers';
import { useToast } from '@/hooks/use-toast';
import { calculateDerivedStatus, getNextBillingDate, formatDate, formatCurrency } from '@/lib/utils';
import type { CustomerFormValues } from '@/lib/schemas';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

const SAVED_INVOICES_STORAGE_KEY = 'wifiCalenderSavedInvoices';
const CUSTOMERS_STORAGE_KEY = 'wifiCalenderCustomers';

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [paymentHistoryCustomer, setPaymentHistoryCustomer] = useState<Customer | null>(null);
  const [invoiceCustomer, setInvoiceCustomer] = useState<Customer | null>(null);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [filters, setFilters] = useState<FilterValues>({
    status: 'Todos',
    searchTerm: '',
  });

  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [isSavedInvoicesDialogOpen, setIsSavedInvoicesDialogOpen] = useState(false);
  const [viewingSavedInvoice, setViewingSavedInvoice] = useState<SavedInvoice | null>(null);
  const [isViewSavedInvoiceDialogOpen, setIsViewSavedInvoiceDialogOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState<string | null>(null);


  useEffect(() => {
    // Load customers from localStorage or use initialCustomers
    try {
      const storedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers).map((c: Customer) => ({
          ...c,
          serviceStartDate: new Date(c.serviceStartDate),
          billingDate: new Date(c.billingDate),
          paymentHistory: c.paymentHistory.map(p => ({...p, date: new Date(p.date)}))
        })));
      } else {
        setCustomers(initialCustomers);
      }
    } catch (error) {
      console.error("Error loading customers from localStorage:", error);
      setCustomers(initialCustomers); // Fallback to initial if error
      toast({
        title: "Error al cargar clientes",
        description: "No se pudieron cargar los clientes guardados. Usando datos iniciales.",
        variant: "destructive",
      });
    }
    setIsLoading(false);

    try {
      const storedInvoices = localStorage.getItem(SAVED_INVOICES_STORAGE_KEY);
      if (storedInvoices) {
        setSavedInvoices(JSON.parse(storedInvoices));
      }
    } catch (error) {
      console.error("Error loading saved invoices from localStorage:", error);
      toast({
        title: "Error al cargar facturas",
        description: "No se pudieron cargar las facturas guardadas.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    if (!isLoading) { // Only save if not initial loading
      try {
        localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
      } catch (error) {
        console.error("Error saving customers to localStorage:", error);
        toast({
          title: "Error al guardar clientes",
          description: "No se pudieron guardar los cambios de los clientes.",
          variant: "destructive",
        });
      }
    }
  }, [customers, isLoading, toast]);


  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleOpenDeleteDialog = (customerId: string) => {
    setCustomerToDeleteId(customerId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (customerToDeleteId) {
      const customerName = customers.find(c => c.id === customerToDeleteId)?.fullName || "El cliente";
      setCustomers(prev => prev.filter(c => c.id !== customerToDeleteId));
      toast({ title: "Cliente Eliminado", description: `${customerName} ha sido eliminado.` });
      setCustomerToDeleteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setCustomerToDeleteId(null);
    setIsDeleteDialogOpen(false);
  };

  const handleViewPayments = (customer: Customer) => {
    setPaymentHistoryCustomer(customer);
  };

  const handleGenerateInvoice = (customer: Customer) => {
    setInvoiceCustomer(customer);
    setIsInvoiceDialogOpen(true);
  };

  const handleSaveInvoice = (invoice: SavedInvoice) => {
    setSavedInvoices(prevInvoices => {
      const updatedInvoices = [...prevInvoices, invoice];
      try {
        localStorage.setItem(SAVED_INVOICES_STORAGE_KEY, JSON.stringify(updatedInvoices));
      } catch (error) {
         console.error("Error saving invoice to localStorage:", error);
         toast({
            title: "Error al guardar factura",
            description: "No se pudo guardar la factura en el almacenamiento local.",
            variant: "destructive",
         });
      }
      return updatedInvoices;
    });
  };

  const handleOpenViewSavedInvoice = (invoice: SavedInvoice) => {
    setViewingSavedInvoice(invoice);
    setIsViewSavedInvoiceDialogOpen(true);
  };

  const handleCloseViewSavedInvoice = () => {
    setViewingSavedInvoice(null);
    setIsViewSavedInvoiceDialogOpen(false);
  };

  const handleDeleteSavedInvoice = (invoiceId: string) => {
    setSavedInvoices(prevInvoices => {
      const updatedInvoices = prevInvoices.filter(inv => inv.id !== invoiceId);
      try {
        localStorage.setItem(SAVED_INVOICES_STORAGE_KEY, JSON.stringify(updatedInvoices));
      } catch (error) {
        console.error("Error updating localStorage after deleting invoice:", error);
        toast({
          title: "Error al eliminar factura",
          description: "No se pudo actualizar el almacenamiento local.",
          variant: "destructive",
        });
      }
      return updatedInvoices;
    });
    toast({ title: "Factura Eliminada", description: `La factura ${invoiceId} ha sido eliminada.`});
    if (viewingSavedInvoice && viewingSavedInvoice.id === invoiceId) {
      handleCloseViewSavedInvoice();
    }
  };


  const handleFormSubmit = (data: CustomerFormValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
      if (editingCustomer) {
        setCustomers(prev =>
          prev.map(c => (c.id === editingCustomer.id ? { ...c, ...data, id: c.id, paymentHistory: c.paymentHistory } : c))
        );
        toast({ title: "Cliente actualizado", description: `${data.fullName} ha sido actualizado.` });
      } else {
        const newCustomer: Customer = {
          ...data,
          id: crypto.randomUUID(),
          paymentHistory: [],
          billingDate: data.currentPaymentStatus === 'Pagado' ? getNextBillingDate(new Date(data.billingDate)) : new Date(data.billingDate)
        };
        setCustomers(prev => [newCustomer, ...prev]);
        toast({ title: "Cliente agregado", description: `${data.fullName} ha sido agregado.` });
      }
      setIsFormOpen(false);
      setEditingCustomer(null);
      setIsSubmitting(false);
    }, 500);
  };

  const handleUpdateCustomerWithPayment = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    if (paymentHistoryCustomer && paymentHistoryCustomer.id === updatedCustomer.id) {
      setPaymentHistoryCustomer(updatedCustomer);
    }
  };

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (filters.searchTerm) {
      const lowerSearchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(customer => {
        const derivedStatus = calculateDerivedStatus(customer).toLowerCase();
        const billingMonth = formatDate(customer.billingDate, 'MMMM').toLowerCase();

        return (
          customer.fullName.toLowerCase().includes(lowerSearchTerm) ||
          billingMonth.includes(lowerSearchTerm) ||
          derivedStatus.includes(lowerSearchTerm)
        );
      });
    }

    if (filters.status !== 'Todos') {
      filtered = filtered.filter(customer => {
        const DerivedStatus = calculateDerivedStatus(customer);
        return DerivedStatus === filters.status;
      });
    }
    
    return filtered;
  }, [customers, filters]);

  const dashboardData = useMemo(() => {
    const totalCustomersCount = customers.length;

    const serviceTypeCounts = customers.reduce((acc, customer) => {
      acc[customer.serviceType] = (acc[customer.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<ServiceType, number>);

    const serviceTypeChartData = [
      { name: 'ROUTER', value: serviceTypeCounts['ROUTER'] || 0, fill: 'hsl(var(--chart-1))' },
      { name: 'EAP', value: serviceTypeCounts['EAP'] || 0, fill: 'hsl(var(--chart-2))' },
    ];
    
    const totalCustomersChartData = [
        { name: "Clientes", value: totalCustomersCount, fill: 'hsl(var(--chart-3))' }
    ];

    const totalMonthlyPotentialIncome = customers.reduce((sum, customer) => sum + customer.monthlyPrice, 0);

    return {
      totalCustomersData: totalCustomersChartData,
      serviceTypeData: serviceTypeChartData,
      totalMonthlyIncome: totalMonthlyPotentialIncome,
    };
  }, [customers]);

  const isFilteringActive = filters.searchTerm !== '' || filters.status !== 'Todos';

  const customerListContent = (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-6 bg-muted rounded w-3/4"></div></CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
              </CardContent>
              <CardFooter><div className="h-8 bg-muted rounded w-1/4 ml-auto"></div></CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={handleEditCustomer}
              onViewPayments={handleViewPayments}
              onGenerateInvoice={handleGenerateInvoice}
              onDelete={handleOpenDeleteDialog}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <WifiOff className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No se encontraron clientes</h3>
          <p className="text-muted-foreground">
            {filters.searchTerm || filters.status !== 'Todos'
              ? "Intenta ajustar los filtros o "
              : "Comienza agregando un nuevo cliente para visualizarlo aquí."}
            {filters.searchTerm || filters.status !== 'Todos'
              ? <Button variant="link" onClick={() => setFilters({ status: 'Todos', searchTerm: '' })}>limpiar filtros.</Button> 
              : ""
            }
          </p>
           {!filters.searchTerm && filters.status === 'Todos' && (
               <Button onClick={handleAddCustomer} className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Agregar Cliente
              </Button>
           )}
        </div>
      )}
    </>
  );

  const dashboardChartsContent = (
    <DashboardCharts
      totalCustomersData={dashboardData.totalCustomersData}
      serviceTypeData={dashboardData.serviceTypeData}
      totalMonthlyIncome={dashboardData.totalMonthlyIncome}
    />
  );

  // Animated wrappers
  const customerListAnimated = (
    <div key={`customer-list-${isFilteringActive}`} className="animate-fadeIn">
      {customerListContent}
    </div>
  );

  const dashboardAnimated = (
    <div key={`dashboard-${isFilteringActive}`} className="animate-fadeIn">
      {dashboardChartsContent}
    </div>
  );


  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader onOpenSavedInvoicesDialog={() => setIsSavedInvoicesDialogOpen(true)} />
      <main className="flex-grow container py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-semibold">Panel de Clientes</h2>
          </div>
          <Button onClick={handleAddCustomer} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Cliente
          </Button>
        </div>

        <CustomerFilters onFilterChange={setFilters} currentFilters={filters} />

        {isFilteringActive ? (
          <>
            {customerListAnimated}
            <div className="mt-8">
              {dashboardAnimated}
            </div>
          </>
        ) : (
          <>
            {dashboardAnimated}
            <div className="mt-8">
             {customerListAnimated}
            </div>
          </>
        )}
      </main>

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditingCustomer(null); } else { setIsFormOpen(true); }}}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] grid grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? 'Modifica los datos del cliente.' : 'Completa el formulario para registrar un nuevo cliente.'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="min-h-0">
            <CustomerForm
              customer={editingCustomer || undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => { setIsFormOpen(false); setEditingCustomer(null); }}
              isSubmitting={isSubmitting}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <PaymentHistoryDialog
        customer={paymentHistoryCustomer}
        isOpen={!!paymentHistoryCustomer}
        onClose={() => setPaymentHistoryCustomer(null)}
        onUpdateCustomer={handleUpdateCustomerWithPayment}
      />

      <InvoiceDialog
        customer={invoiceCustomer}
        isOpen={isInvoiceDialogOpen}
        onClose={() => {
          setInvoiceCustomer(null);
          setIsInvoiceDialogOpen(false);
        }}
        onSaveInvoice={handleSaveInvoice}
      />

      <SavedInvoicesDialog
        isOpen={isSavedInvoicesDialogOpen}
        onClose={() => setIsSavedInvoicesDialogOpen(false)}
        invoices={savedInvoices}
        onViewInvoice={handleOpenViewSavedInvoice}
      />

      <ViewSavedInvoiceDialog
        isOpen={isViewSavedInvoiceDialogOpen}
        onClose={handleCloseViewSavedInvoice}
        invoice={viewingSavedInvoice}
        onDelete={handleDeleteSavedInvoice}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente
              <span className="font-semibold"> {customers.find(c => c.id === customerToDeleteId)?.fullName || ''} </span>
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="text-center py-6 border-t text-sm text-muted-foreground">
        © {new Date().getFullYear()} WIFI CALENDER. Creado con ❤️.
      </footer>
    </div>
  );
}

