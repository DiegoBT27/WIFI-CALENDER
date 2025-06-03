
import type { Customer } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Phone, CalendarDays, DollarSign, Edit, History, Info, Wifi, Clock, FileText, Gauge, Trash2, CalendarClock, Briefcase } from 'lucide-react';
import { CustomerStatusBadge } from './customer-status-badge';
import { formatDate, formatCurrency, calculateDerivedStatus } from '@/lib/utils';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onViewPayments: (customer: Customer) => void;
  onGenerateInvoice: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
}

export function CustomerCard({ customer, onEdit, onViewPayments, onGenerateInvoice, onDelete }: CustomerCardProps) {
  const derivedStatus = calculateDerivedStatus(customer);

  const getPriceLabelPrefix = (timeType: Customer['clientTimeType'] | undefined) => {
    switch (timeType) {
      case 'Hora':
        return 'Precio Hora';
      case 'Semanal':
        return 'Precio Semanal';
      case 'Mensual':
      default:
        return 'Precio Mensual';
    }
  };

  return (
    <Card className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="relative pb-2">
        <div className="absolute top-4 right-4">
             <CustomerStatusBadge status={derivedStatus} />
        </div>
        <CardTitle className="text-lg flex items-center gap-2 pr-12">
          <User className="h-5 w-5 text-primary" />
          {customer.fullName}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {customer.phoneNumber}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm pt-4">
        {customer.profileName && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span><span className="font-semibold">Perfil:</span> {customer.profileName}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-muted-foreground" />
          <span><span className="font-semibold">Servicio:</span> {customer.serviceType.toLowerCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span><span className="font-semibold">Modalidad:</span> {customer.clientTimeType}</span>
        </div>
         {customer.planSpeed && (
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span><span className="font-semibold">Plan:</span> {customer.planSpeed}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
          <span><span className="font-semibold">Fecha de inicio:</span> {formatDate(customer.serviceStartDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span><span className="font-semibold">Próximo corte:</span> {formatDate(customer.billingDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span><span className="font-semibold">{getPriceLabelPrefix(customer.clientTimeType)}:</span> {formatCurrency(customer.monthlyPrice)}</span>
        </div>
        {customer.observations && (
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
            <span className="truncate" title={customer.observations}><span className="font-semibold">Obs:</span> {customer.observations}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-center gap-2 sm:gap-3 border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => onGenerateInvoice(customer)} className="flex-grow sm:flex-grow-0">
          <FileText className="mr-1 h-3.5 w-3.5" />
          Factura
        </Button>
        <Button variant="outline" size="sm" onClick={() => onViewPayments(customer)} className="flex-grow sm:flex-grow-0">
          <History className="mr-1 h-3.5 w-3.5" />
          Pagos
        </Button>
        <Button variant="default" size="sm" onClick={() => onEdit(customer)} className="flex-grow sm:flex-grow-0">
          <Edit className="mr-1 h-3.5 w-3.5" />
          Editar
        </Button>
        <Button variant="destructive" size="icon" onClick={() => onDelete(customer.id)} className="flex-grow-0 h-9 w-9" aria-label="Eliminar cliente">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
