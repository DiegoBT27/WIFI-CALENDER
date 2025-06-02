
import type { PaymentStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, XCircle, AlertTriangle, type Icon } from 'lucide-react';

interface CustomerStatusBadgeProps {
  status: PaymentStatus;
}

export function CustomerStatusBadge({ status }: CustomerStatusBadgeProps) {
  const statusConfig: Record<PaymentStatus, { color: string, icon: Icon, label: string }> = {
    'Pagado': { color: 'bg-green-500 hover:bg-green-600', icon: CheckCircle2, label: 'Pagado' },
    'Pendiente': { color: 'bg-orange-500 hover:bg-orange-600', icon: AlertCircle, label: 'Pendiente' },
    'Vencido': { color: 'bg-red-700 hover:bg-red-800', icon: XCircle, label: 'Vencido' },
    'Próximo a vencer': { color: 'bg-yellow-500 hover:bg-yellow-600 text-black', icon: AlertTriangle, label: 'Próximo a vencer' },
  };

  const { color, icon: IconComponent, label } = statusConfig[status];

  return (
    <Badge className={cn("text-white p-1.5", color)} title={label}>
      <IconComponent className="h-5 w-5" />
    </Badge>
  );
}

