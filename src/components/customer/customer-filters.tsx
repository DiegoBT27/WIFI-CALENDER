
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PaymentStatus, ServiceType } from '@/lib/types';

export type FilterValues = {
  status: PaymentStatus | 'Todos';
  searchTerm: string;
  serviceType: ServiceType | 'Todos';
};

interface CustomerFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  currentFilters: FilterValues;
}

const availableStatuses: (PaymentStatus | 'Todos')[] = ['Todos', 'Pagado', 'Pendiente', 'Vencido', 'Próximo a vencer'];
const availableServiceTypes: (ServiceType | 'Todos')[] = ['Todos', 'ROUTER', 'EAP'];

export function CustomerFilters({ onFilterChange, currentFilters }: CustomerFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFilterChange({ ...currentFilters, status: value as PaymentStatus | 'Todos' });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...currentFilters, searchTerm: event.target.value });
  };

  const handleServiceTypeChange = (value: string) => {
    onFilterChange({ ...currentFilters, serviceType: value as ServiceType | 'Todos' });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg shadow">
      <div className="flex-1">
        <Label htmlFor="search-filter" className="mb-1 block text-sm font-medium">Buscar cliente</Label>
        <Input
          id="search-filter"
          type="text"
          placeholder="Buscar por nombre..."
          value={currentFilters.searchTerm}
          onChange={handleSearchChange}
          className="h-10"
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="status-filter" className="mb-1 block text-sm font-medium">Filtrar por estado</Label>
        <Select value={currentFilters.status} onValueChange={handleStatusChange}>
          <SelectTrigger id="status-filter" className="h-10">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1">
        <Label htmlFor="service-type-filter" className="mb-1 block text-sm font-medium">Filtrar por servicio</Label>
        <Select value={currentFilters.serviceType} onValueChange={handleServiceTypeChange}>
          <SelectTrigger id="service-type-filter" className="h-10">
            <SelectValue placeholder="Tipo de Servicio" />
          </SelectTrigger>
          <SelectContent>
            {availableServiceTypes.map(type => (
              <SelectItem key={type} value={type}>{type === 'Todos' ? 'Todos los servicios' : type.toLowerCase()}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
