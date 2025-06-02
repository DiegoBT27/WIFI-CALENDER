
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
import type { PaymentStatus } from '@/lib/types';

export type FilterValues = {
  status: PaymentStatus | 'Todos';
  searchTerm: string;
};

interface CustomerFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  currentFilters: FilterValues;
}

const availableStatuses: (PaymentStatus | 'Todos')[] = ['Todos', 'Pagado', 'Pendiente', 'Vencido', 'Próximo a vencer'];

export function CustomerFilters({ onFilterChange, currentFilters }: CustomerFiltersProps) {
  const handleStatusChange = (value: string) => {
    onFilterChange({ ...currentFilters, status: value as PaymentStatus | 'Todos' });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...currentFilters, searchTerm: event.target.value });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg shadow">
      <div className="flex-1">
        <Label htmlFor="search-filter" className="mb-1 block text-sm font-medium">Buscar cliente</Label>
        <Input
          id="search-filter"
          type="text"
          placeholder="Nombre, mes de corte, estado..."
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
    </div>
  );
}
