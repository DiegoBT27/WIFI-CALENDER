
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import type { Customer, PaymentStatus, ServiceType, SavedInvoice } from '@/lib/types';
import { CustomerCard } from '@/components/customer/customer-card';
import { CustomerForm } from '@/components/customer/customer-form';
import { PaymentHistoryDialog } from '@/components/customer/payment-history-dialog';
import { InvoiceDialog } from '@/components/customer/invoice-dialog';
import { SavedInvoicesDialog } from '@/components/invoice/saved-invoices-dialog';
import { ViewSavedInvoiceDialog } from '@/components/invoice/view-saved-invoice-dialog';
import { ManageProfilesDialog } from '@/components/profile/manage-profiles-dialog';
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
import { PlusCircle, Users, WifiOff, Settings } from 'lucide-react';
import { initialCustomers } from '@/lib/initial-customers';
import { useToast } from '@/hooks/use-toast';
import { calculateDerivedStatus, formatDate, formatCurrency } from '@/lib/utils';
import type { CustomerFormValues } from '@/lib/schemas';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

const SAVED_INVOICES_STORAGE_KEY = 'wifiCalenderSavedInvoices';
const CUSTOMERS_STORAGE_KEY = 'wifiCalenderCustomers';
const PROFILES_STORAGE_KEY = 'wifiCalenderProfiles';
const ALL_PROFILES_KEY = "Todos los Perfiles";

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

  const [definedProfiles, setDefinedProfiles] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>(ALL_PROFILES_KEY);
  const [isManageProfilesDialogOpen, setIsManageProfilesDialogOpen] = useState(false);


  const [filters, setFilters] = useState<FilterValues>({
    status: 'Todos',
    searchTerm: '',
    serviceType: 'Todos',
  });

  const [savedInvoices, setSavedInvoices] = useState<SavedInvoice[]>([]);
  const [isSavedInvoicesDialogOpen, setIsSavedInvoicesDialogOpen] = useState(false);
  const [viewingSavedInvoice, setViewingSavedInvoice] = useState<SavedInvoice | null>(null);
  const [isViewSavedInvoiceDialogOpen, setIsViewSavedInvoiceDialogOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDeleteId, setCustomerToDeleteId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    // Load Customers
    try {
      const storedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (storedCustomers) {
        const parsedCustomers: Customer[] = JSON.parse(storedCustomers).map((c: any) => ({
          ...c,
          serviceStartDate: new Date(c.serviceStartDate),
          billingDate: new Date(c.billingDate),
          paymentHistory: Array.isArray(c.paymentHistory) ? c.paymentHistory.map((p: any) => ({
            ...p,
            date: new Date(p.date),
          })) : [],
          profileName: c.profileName || null,
        }));
        setCustomers(parsedCustomers);
      } else {
        setCustomers(initialCustomers);
      }
    } catch (error) {
      console.error("Error loading customers from localStorage:", error);
      toast({
        title: "Error al cargar clientes",
        description: "No se pudieron cargar los clientes guardados. Se usarán datos iniciales.",
        variant: "destructive",
      });
      setCustomers(initialCustomers);
    }

    // Load Defined Profiles
    try {
      const storedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (storedProfiles) {
        setDefinedProfiles(JSON.parse(storedProfiles));
      }
    } catch (error) {
      console.error("Error loading profiles from localStorage:", error);
      toast({
        title: "Error al cargar perfiles",
        description: "No se pudieron cargar los perfiles guardados.",
        variant: "destructive",
      });
    }

    // Load Saved Invoices
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
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    if (!isLoading) {
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

  useEffect(() => {
    if(!isLoading) {
      try {
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(definedProfiles));
      } catch (error) {
        console.error("Error saving profiles to localStorage:", error);
        toast({
          title: "Error al guardar perfiles",
          description: "No se pudieron guardar los perfiles.",
          variant: "destructive",
        });
      }
    }
  }, [definedProfiles, isLoading, toast]);


  const availableProfilesForSelection = useMemo(() => {
    return [ALL_PROFILES_KEY, ...definedProfiles.sort()];
  }, [definedProfiles]);

  const handleProfileChange = (profile: string) => {
    setSelectedProfile(profile);
    setFilters({ status: 'Todos', searchTerm: '', serviceType: 'Todos' });
  };

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
      const profileToAssign = data.profileName === "Ninguno" ? null : data.profileName;
      if (editingCustomer) {
        setCustomers(prev =>
          prev.map(c => (c.id === editingCustomer.id ? { ...c, ...data, id: c.id, paymentHistory: c.paymentHistory, serviceStartDate: new Date(data.serviceStartDate), billingDate: new Date(data.billingDate), profileName: profileToAssign } : c))
        );
        toast({ title: "Cliente actualizado", description: `${data.fullName} ha sido actualizado.` });
      } else {
        const newCustomer: Customer = {
          ...data,
          id: crypto.randomUUID(),
          paymentHistory: [],
          serviceStartDate: new Date(data.serviceStartDate),
          billingDate: new Date(data.billingDate),
          profileName: profileToAssign,
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

  const handleExportCustomers = () => {
    if (customers.length === 0) {
      toast({ title: "Sin clientes", description: "No hay clientes para exportar.", variant: "default" });
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(customers, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "wifi-calender-clientes.json";
    link.click();
    toast({ title: "Exportación Exitosa", description: "Lista de clientes exportada." });
  };

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleImportCustomers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      toast({ title: "Archivo Inválido", description: "Por favor, selecciona un archivo .json.", variant: "destructive" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Error al leer el archivo.");
        }
        const importedData = JSON.parse(text);

        if (!Array.isArray(importedData)) {
          throw new Error("El archivo JSON debe contener un array de clientes.");
        }

        const importedCustomers: Customer[] = [];
        const encounteredProfiles = new Set<string>(definedProfiles);

        importedData.forEach((item: any) => {
          if (typeof item.id === 'undefined' || typeof item.fullName === 'undefined') {
              console.warn("Saltando item inválido durante la importación:", item);
              return;
          }
          const validatedItem: Customer = {
            ...item,
            serviceStartDate: new Date(item.serviceStartDate),
            billingDate: new Date(item.billingDate),
            paymentHistory: (item.paymentHistory || []).map((p: any) => ({
              ...p,
              date: new Date(p.date),
            })),
            profileName: item.profileName === "Ninguno" || item.profileName === "" ? null : item.profileName || null,
          };
          importedCustomers.push(validatedItem);
          if (validatedItem.profileName && !encounteredProfiles.has(validatedItem.profileName)) {
            encounteredProfiles.add(validatedItem.profileName);
          }
        });
        
        setCustomers(prevCustomers => {
          const customersMap = new Map(prevCustomers.map(c => [c.id, c]));
          importedCustomers.forEach(importedCustomer => {
            customersMap.set(importedCustomer.id, importedCustomer);
          });
          return Array.from(customersMap.values());
        });
        setDefinedProfiles(Array.from(encounteredProfiles).sort());


        toast({ title: "Importación Exitosa", description: "Clientes y perfiles importados/actualizados correctamente." });
      } catch (error: any) {
        console.error("Error al importar clientes:", error);
        toast({ title: "Error de Importación", description: error.message || "No se pudo procesar el archivo JSON.", variant: "destructive" });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
        toast({ title: "Error de Lectura", description: "No se pudo leer el archivo.", variant: "destructive" });
        if (fileInputRef.current) fileInputRef.current.value = "";
    }
    reader.readAsText(file);
  };

  const customersForProfileView = useMemo(() => {
    if (selectedProfile === ALL_PROFILES_KEY) {
      return customers;
    }
    return customers.filter(c => c.profileName === selectedProfile);
  }, [customers, selectedProfile]);


  const filteredCustomers = useMemo(() => {
    let filtered = customersForProfileView;

    if (filters.searchTerm) {
      const lowerSearchTerm = filters.searchTerm.toLowerCase().trim();
      if (lowerSearchTerm) {
        filtered = filtered.filter(customer => {
          const customerName = customer.fullName.toLowerCase().trim();
          return customerName.includes(lowerSearchTerm);
        });
      }
    }

    if (filters.status !== 'Todos') {
      filtered = filtered.filter(customer => {
        const derivedStatus = calculateDerivedStatus(customer);
        return derivedStatus === filters.status;
      });
    }

    if (filters.serviceType !== 'Todos') {
      filtered = filtered.filter(customer => customer.serviceType === filters.serviceType);
    }
    
    return filtered;
  }, [customersForProfileView, filters]);

  const dashboardData = useMemo(() => {
    const sourceCustomers = customersForProfileView;
    
    const serviceTypeCounts = sourceCustomers.reduce((acc, customer) => {
      acc[customer.serviceType] = (acc[customer.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<ServiceType, number>);
    
    const routerCount = serviceTypeCounts['ROUTER'] || 0;
    const eapCount = serviceTypeCounts['EAP'] || 0;
    const totalCustomersCountForChart = sourceCustomers.length;

    const serviceTypeChartData = [
      { name: 'router', value: routerCount, fill: 'hsl(var(--chart-1))' },
      { name: 'eap', value: eapCount, fill: 'hsl(var(--chart-2))' },
    ];
    
    const totalCustomersChartData = [
        { name: "Clientes", value: totalCustomersCountForChart, fill: 'hsl(var(--chart-3))' }
    ];

    const totalMonthlyPotentialIncome = sourceCustomers.reduce((sum, customer) => sum + customer.monthlyPrice, 0);

    return {
      totalCustomersData: totalCustomersChartData,
      serviceTypeData: serviceTypeChartData,
      totalMonthlyIncome: totalMonthlyPotentialIncome,
      actualTotalCustomers: totalCustomersCountForChart,
      actualRouterCount: routerCount,
      actualEapCount: eapCount,
    };
  }, [customersForProfileView]);

  const isFilteringActive = filters.searchTerm !== '' || filters.status !== 'Todos' || filters.serviceType !== 'Todos';

  const handleAddProfile = (profileName: string) => {
    setDefinedProfiles(prev => [...prev, profileName].sort());
  };

  const handleDeleteProfile = (profileNameToDelete: string) => {
    setDefinedProfiles(prev => prev.filter(p => p !== profileNameToDelete));
    setCustomers(prevCustomers => 
      prevCustomers.map(c => 
        c.profileName === profileNameToDelete ? { ...c, profileName: null } : c
      )
    );
    if (selectedProfile === profileNameToDelete) {
      setSelectedProfile(ALL_PROFILES_KEY);
    }
    toast({
      title: 'Perfil Eliminado',
      description: `El perfil "${profileNameToDelete}" ha sido eliminado. Los clientes asociados han sido desvinculados.`,
    });
  };


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
          <h3 className="text-xl font-semibold mb-2">
            {selectedProfile !== ALL_PROFILES_KEY && customersForProfileView.length === 0
              ? `No hay clientes en el perfil "${selectedProfile}"`
              : "No se encontraron clientes"}
          </h3>
          <p className="text-muted-foreground">
            {isFilteringActive
              ? "Intenta ajustar los filtros o "
              : (selectedProfile !== ALL_PROFILES_KEY && customersForProfileView.length === 0)
                ? "Puedes agregar clientes a este perfil o cambiar de perfil."
                : "Comienza agregando un nuevo cliente para visualizarlo aquí."}
            {isFilteringActive
              ? <Button variant="link" onClick={() => setFilters({ status: 'Todos', searchTerm: '', serviceType: 'Todos' })}>limpiar filtros.</Button>
              : ""
            }
          </p>
           {!isFilteringActive && !(selectedProfile !== ALL_PROFILES_KEY && customersForProfileView.length === 0) && (
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

  const customerListAnimated = (
    <div key={`customer-list-${isFilteringActive}-${selectedProfile}`} className="animate-fadeIn">
      {customerListContent}
    </div>
  );

  const dashboardAnimated = (
    <div key={`dashboard-${isFilteringActive}-${selectedProfile}`} className="animate-fadeIn">
      {dashboardChartsContent}
    </div>
  );


  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        onOpenSavedInvoicesDialog={() => setIsSavedInvoicesDialogOpen(true)}
        onOpenManageProfilesDialog={() => setIsManageProfilesDialogOpen(true)}
        onExportCustomers={handleExportCustomers}
        onTriggerImportCustomers={handleTriggerImport}
        availableProfiles={availableProfilesForSelection}
        selectedProfile={selectedProfile}
        onProfileChange={handleProfileChange}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportCustomers}
        accept=".json"
        className="hidden"
      />
      <main className="flex-grow container py-2 sm:py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-semibold">
              {selectedProfile === ALL_PROFILES_KEY ? "PANEL DE CLIENTES" : `PERFIL: ${selectedProfile.toUpperCase()}`}
            </h2>
          </div>
          <Button
            onClick={handleAddCustomer}
            size="lg"
            className="w-[80%] sm:w-auto mt-[10px] sm:mt-0"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Cliente
          </Button>
        </div>

        <CustomerFilters onFilterChange={setFilters} currentFilters={filters} />

        {isFilteringActive || selectedProfile !== ALL_PROFILES_KEY ? (
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
              definedProfiles={definedProfiles}
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

       <ManageProfilesDialog
        isOpen={isManageProfilesDialogOpen}
        onClose={() => setIsManageProfilesDialogOpen(false)}
        definedProfiles={definedProfiles}
        onAddProfile={handleAddProfile}
        onDeleteProfile={handleDeleteProfile}
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
